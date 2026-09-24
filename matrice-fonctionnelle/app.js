import {
  PATIENT_INFO_FIELDS,
  MOTIVATIONS_ITEMS,
  MOTIVATIONS_COLUMNS,
  MOTIVATIONS_EXTRA_FIELDS,
  SECTIONS,
  ATM_MOVEMENTS,
  ATM_COLUMNS,
  PROBLEMES_FIELDS,
  MANAGEMENT,
} from './fields.js';
import { supabase } from '../js/supabase-client.js';

const TABLE = 'matrice_fonctionnelle';

const els = {
  tabs: document.querySelectorAll('.tab-btn'),
  views: {
    form: document.getElementById('view-form'),
    list: document.getElementById('view-list'),
    detail: document.getElementById('view-detail'),
  },
  form: document.getElementById('matrice-form'),
  btnReset: document.getElementById('btn-reset'),
  fichesTbody: document.getElementById('fiches-tbody'),
  listEmpty: document.getElementById('list-empty'),
  listError: document.getElementById('list-error'),
  detailContent: document.getElementById('detail-content'),
  btnPrint: document.getElementById('btn-print'),
  btnEdit: document.getElementById('btn-edit'),
  btnDelete: document.getElementById('btn-delete'),
  btnBack: document.getElementById('btn-back'),
  formError: document.getElementById('form-error'),
};

let editingId = null;
let currentDetailId = null;

// ---------------------------------------------------------------------------
// Accès aux données (Supabase)
// ---------------------------------------------------------------------------

function rowToRecord(row) {
  return { id: row.id, nom: row.nom, prenom: row.prenom, date: row.date_fiche, ...row.data };
}

function recordToRow(data) {
  const { nom, prenom, date, ...rest } = data;
  return { nom, prenom, date_fiche: date, data: rest };
}

async function fetchRecords() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, nom, prenom, date_fiche, data')
    .order('date_fiche', { ascending: false });
  if (error) throw error;
  return data.map(rowToRecord);
}

async function fetchRecordById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, nom, prenom, date_fiche, data')
    .eq('id', id)
    .single();
  if (error) throw error;
  return rowToRecord(data);
}

async function insertRecord(data) {
  const { error } = await supabase.from(TABLE).insert(recordToRow(data));
  if (error) throw error;
}

async function updateRecord(id, data) {
  const { error } = await supabase.from(TABLE).update(recordToRow(data)).eq('id', id);
  if (error) throw error;
}

async function deleteRecord(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Rendu générique de champs (select / text / number / date / textarea)
// ---------------------------------------------------------------------------

function buildFieldInput(name, field) {
  if (field.type === 'select') {
    const select = document.createElement('select');
    select.id = name;
    select.name = name;
    for (const opt of field.options) {
      const optionEl = document.createElement('option');
      optionEl.value = opt;
      optionEl.textContent = opt;
      select.appendChild(optionEl);
    }
    return select;
  }
  if (field.type === 'textarea') {
    const textarea = document.createElement('textarea');
    textarea.id = name;
    textarea.name = name;
    textarea.rows = 3;
    return textarea;
  }
  const input = document.createElement('input');
  input.type = field.type; // text | number | date
  input.id = name;
  input.name = name;
  return input;
}

function buildField(prefix, field) {
  const name = `${prefix}_${field.key}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  if (field.type === 'textarea') wrapper.classList.add('field--wide');
  const label = document.createElement('label');
  label.setAttribute('for', name);
  label.textContent = field.label;
  wrapper.appendChild(label);
  wrapper.appendChild(buildFieldInput(name, field));
  return wrapper;
}

function buildSectionFieldset(section) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = `group-block group-${section.id}`;
  const legend = document.createElement('legend');
  legend.textContent = `${section.number} — ${section.title}`;
  fieldset.appendChild(legend);
  const fieldsWrapper = document.createElement('div');
  fieldsWrapper.className = 'group-block__fields';
  for (const field of section.fields) {
    fieldsWrapper.appendChild(buildField(section.id, field));
  }
  fieldset.appendChild(fieldsWrapper);
  return fieldset;
}

function buildBanner(text) {
  const h2 = document.createElement('h2');
  h2.className = 'section-banner';
  h2.textContent = text;
  return h2;
}

// ---------------------------------------------------------------------------
// Identification
// ---------------------------------------------------------------------------

function renderIdentificationFields() {
  const container = document.getElementById('identification-fields');
  container.innerHTML = '';
  for (const field of PATIENT_INFO_FIELDS) {
    container.appendChild(buildField('info', field));
  }
}

// ---------------------------------------------------------------------------
// 1 — Motivations majeures
// ---------------------------------------------------------------------------

function renderMotivationsSection() {
  const container = document.getElementById('motivations-section');
  container.innerHTML = '';
  container.appendChild(buildBanner('1 — Motivations majeures pour le patient'));

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'group-block group-motivations';
  const legend = document.createElement('legend');
  legend.textContent = 'Qui a exprimé la motivation ?';
  fieldset.appendChild(legend);

  const table = document.createElement('table');
  table.className = 'motiv-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = '<th></th>' + MOTIVATIONS_COLUMNS.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('');
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const item of MOTIVATIONS_ITEMS) {
    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.textContent = item.label;
    tr.appendChild(tdLabel);
    for (const col of MOTIVATIONS_COLUMNS) {
      const td = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = `motiv_${item.key}_${col.key}`;
      td.appendChild(checkbox);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  fieldset.appendChild(table);

  const extraWrapper = document.createElement('div');
  extraWrapper.className = 'group-block__fields group-block__fields--wrap';
  for (const field of MOTIVATIONS_EXTRA_FIELDS) {
    extraWrapper.appendChild(buildField('motivExtra', field));
  }
  fieldset.appendChild(extraWrapper);

  container.appendChild(fieldset);
}

// ---------------------------------------------------------------------------
// Sections génériques (2.x / 3.x) regroupées dans une grille
// ---------------------------------------------------------------------------

function renderSectionGrid(containerId, sectionIds) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (const id of sectionIds) {
    const section = SECTIONS.find((s) => s.id === id);
    if (section) container.appendChild(buildSectionFieldset(section));
  }
}

// ---------------------------------------------------------------------------
// 4 — Évaluation faciale / 6 — Personnalité (sections standalone)
// ---------------------------------------------------------------------------

function renderStandaloneSection(containerId, sectionId, bannerText) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  container.appendChild(buildBanner(bannerText));
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (section) container.appendChild(buildSectionFieldset(section));
}

// ---------------------------------------------------------------------------
// 5 — Évaluation de l'ATM (grille claquements/douleurs + champs)
// ---------------------------------------------------------------------------

function renderAtmSection() {
  const container = document.getElementById('section-atm');
  container.innerHTML = '';
  container.appendChild(buildBanner("5 — Évaluation de l'ATM"));

  const section = SECTIONS.find((s) => s.id === 'atm');
  const fieldset = buildSectionFieldset(section);

  const table = document.createElement('table');
  table.className = 'atm-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = '<th>Mouvements mandibulaires</th>' + ATM_COLUMNS.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('');
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const movement of ATM_MOVEMENTS) {
    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.textContent = movement.label;
    tr.appendChild(tdLabel);
    for (const col of ATM_COLUMNS) {
      const td = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = `atmGrid_${movement.key}_${col.key}`;
      td.appendChild(checkbox);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  fieldset.insertBefore(table, fieldset.querySelector('.group-block__fields'));

  container.appendChild(fieldset);
}

// ---------------------------------------------------------------------------
// 7/8 — Problèmes particuliers et médicaux
// ---------------------------------------------------------------------------

function renderProblemesSection() {
  const container = document.getElementById('problemes-section');
  container.innerHTML = '';
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'group-block group-problemes';
  const legend = document.createElement('legend');
  legend.textContent = '7/8 — Problèmes particuliers et médicaux';
  fieldset.appendChild(legend);

  const wrapper = document.createElement('div');
  wrapper.className = 'group-block__fields group-block__fields--2';
  for (const field of PROBLEMES_FIELDS) {
    const div = document.createElement('div');
    div.className = 'field field--wide';
    const label = document.createElement('label');
    label.setAttribute('for', `problemes_${field.key}`);
    label.textContent = field.label;
    const textarea = document.createElement('textarea');
    textarea.id = `problemes_${field.key}`;
    textarea.name = `problemes_${field.key}`;
    textarea.rows = 4;
    div.appendChild(label);
    div.appendChild(textarea);
    wrapper.appendChild(div);
  }
  fieldset.appendChild(wrapper);
  container.appendChild(fieldset);
}

// ---------------------------------------------------------------------------
// Management
// ---------------------------------------------------------------------------

function buildRadioItem(name, value, label) {
  const item = document.createElement('label');
  item.className = 'choice-item';
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = name;
  input.value = value;
  item.appendChild(input);
  item.appendChild(document.createTextNode(label));
  return item;
}

function buildCheckboxItem(name, label) {
  const item = document.createElement('label');
  item.className = 'choice-item';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.name = name;
  item.appendChild(input);
  item.appendChild(document.createTextNode(label));
  return item;
}

function renderManagementSection() {
  const container = document.getElementById('management-section');
  container.innerHTML = '';
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'group-block group-management';
  const legend = document.createElement('legend');
  legend.textContent = 'Management';
  fieldset.appendChild(legend);

  const traitementRow = document.createElement('div');
  traitementRow.className = 'choice-row';
  for (const opt of MANAGEMENT.traitementOptions) {
    traitementRow.appendChild(buildRadioItem('mgmt_traitement', opt.value, opt.label));
  }
  fieldset.appendChild(traitementRow);

  const raisonRow = document.createElement('div');
  raisonRow.className = 'choice-row choice-row--indent';
  raisonRow.appendChild(buildRadioItem('mgmt_raisonTropTot', 'revoir_en', 'Revoir en :'));
  const revoirEnInput = document.createElement('input');
  revoirEnInput.type = 'text';
  revoirEnInput.name = 'mgmt_revoirEn';
  revoirEnInput.className = 'inline-text';
  raisonRow.appendChild(revoirEnInput);
  for (const opt of MANAGEMENT.raisonsTropTot.filter((o) => o.value !== 'revoir_en')) {
    raisonRow.appendChild(buildRadioItem('mgmt_raisonTropTot', opt.value, opt.label));
  }
  fieldset.appendChild(raisonRow);

  const rdvRow = document.createElement('div');
  rdvRow.className = 'choice-row';
  rdvRow.appendChild(document.createTextNode('Prévoir les rendez-vous suivants : '));
  for (const opt of MANAGEMENT.rdvSuivants) {
    rdvRow.appendChild(buildCheckboxItem(`mgmt_rdv_${opt.key}`, opt.label));
  }
  fieldset.appendChild(rdvRow);

  const examensRow = document.createElement('div');
  examensRow.className = 'choice-row';
  examensRow.appendChild(document.createTextNode('Examens nécessaires : '));
  examensRow.appendChild(buildCheckboxItem('mgmt_examens_deBase', 'De base'));
  examensRow.appendChild(buildCheckboxItem('mgmt_examens_autres', 'Autres :'));
  const examensAutresInput = document.createElement('input');
  examensAutresInput.type = 'text';
  examensAutresInput.name = 'mgmt_examensAutresDetail';
  examensAutresInput.className = 'inline-text';
  examensRow.appendChild(examensAutresInput);
  fieldset.appendChild(examensRow);

  const courrierRow = document.createElement('div');
  courrierRow.className = 'choice-row';
  courrierRow.appendChild(document.createTextNode('Courrier pour : '));
  courrierRow.appendChild(buildCheckboxItem('mgmt_courrier_soins', 'Soins'));
  courrierRow.appendChild(buildCheckboxItem('mgmt_courrier_reeducation', 'Rééducation'));
  courrierRow.appendChild(buildCheckboxItem('mgmt_courrier_autres', 'Autres :'));
  const courrierAutresInput = document.createElement('input');
  courrierAutresInput.type = 'text';
  courrierAutresInput.name = 'mgmt_courrierAutresDetail';
  courrierAutresInput.className = 'inline-text';
  courrierRow.appendChild(courrierAutresInput);
  fieldset.appendChild(courrierRow);

  const explicationsRow = document.createElement('div');
  explicationsRow.className = 'choice-row choice-row--column';
  explicationsRow.appendChild(document.createTextNode('Explications données :'));
  for (const opt of MANAGEMENT.explicationsDonnees) {
    explicationsRow.appendChild(buildCheckboxItem(`mgmt_explication_${opt.key}`, opt.label));
  }
  fieldset.appendChild(explicationsRow);

  container.appendChild(fieldset);
}

// ---------------------------------------------------------------------------
// Degré de difficulté clinique
// ---------------------------------------------------------------------------

function renderDegreDifficulte() {
  const container = document.getElementById('degre-difficulte-section');
  container.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'degre-box';
  const label = document.createElement('div');
  label.className = 'degre-box__label';
  label.textContent = 'Degré de difficulté clinique';
  const select = document.createElement('select');
  select.id = 'degreDifficulteClinique';
  select.name = 'degreDifficulteClinique';
  for (const v of ['', '1', '2', '3', '4', '5']) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v || '—';
    select.appendChild(opt);
  }
  box.appendChild(label);
  box.appendChild(select);
  container.appendChild(box);
}

// ---------------------------------------------------------------------------
// Construction complète du formulaire
// ---------------------------------------------------------------------------

function renderForm() {
  renderIdentificationFields();
  renderMotivationsSection();
  renderSectionGrid('sections-matrice', ['voiesAeriennes', 'musculature', 'habitudes', 'posture', 'mastication']);
  renderSectionGrid('sections-denture', ['occlusale', 'fonctionnelle', 'esthetique', 'clinique']);
  renderStandaloneSection('section-faciale', 'faciale', '4 — Évaluation faciale');
  renderAtmSection();
  renderStandaloneSection('section-personnalite', 'personnalite', '6 — Évaluation de la personnalité');
  renderProblemesSection();
  renderManagementSection();
  renderDegreDifficulte();
}

// ---------------------------------------------------------------------------
// Collecte / remplissage du formulaire
// ---------------------------------------------------------------------------

function collectFormData() {
  const data = {
    nom: document.getElementById('input-nom').value.trim(),
    prenom: document.getElementById('input-prenom').value.trim(),
    date: document.getElementById('input-date').value,
  };
  const formData = new FormData(els.form);
  for (const [key, value] of formData.entries()) {
    if (key === 'nom' || key === 'prenom' || key === 'date') continue;
    data[key] = value;
  }
  els.form.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    data[cb.name] = cb.checked;
  });
  return data;
}

function fillFormWithRecord(record) {
  els.form.reset();
  document.getElementById('input-nom').value = record.nom || '';
  document.getElementById('input-prenom').value = record.prenom || '';
  document.getElementById('input-date').value = record.date || '';
  for (const [key, value] of Object.entries(record)) {
    if (['id', 'nom', 'prenom', 'date'].includes(key)) continue;
    const el = els.form.elements.namedItem(key);
    if (!el) continue;
    if (el instanceof RadioNodeList) {
      el.value = value;
    } else if (el.type === 'checkbox') {
      el.checked = !!value;
    } else {
      el.value = value ?? '';
    }
  }
}

function resetForm() {
  els.form.reset();
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('input-date').value = today;
  const dateCS = els.form.elements.namedItem('info_dateCS');
  if (dateCS) dateCS.value = today;
  editingId = null;
}

// ---------------------------------------------------------------------------
// Vues : liste / détail / impression
// ---------------------------------------------------------------------------

function switchView(name) {
  for (const [key, el] of Object.entries(els.views)) {
    el.classList.toggle('hidden', key !== name);
  }
  for (const btn of els.tabs) {
    btn.classList.toggle('active', btn.dataset.view === name);
  }
}

async function renderList() {
  els.listError.classList.add('hidden');
  els.fichesTbody.innerHTML = '';
  let records = [];
  try {
    records = await fetchRecords();
  } catch (err) {
    els.listError.textContent = `Impossible de charger les fiches : ${err.message}`;
    els.listError.classList.remove('hidden');
    els.listEmpty.classList.add('hidden');
    return;
  }
  els.listEmpty.classList.toggle('hidden', records.length > 0);
  for (const record of records) {
    const tr = document.createElement('tr');

    const tdNom = document.createElement('td');
    tdNom.textContent = record.nom;
    const tdPrenom = document.createElement('td');
    tdPrenom.textContent = record.prenom;
    const tdDate = document.createElement('td');
    tdDate.textContent = formatDate(record.date);

    const tdActions = document.createElement('td');
    const btnView = document.createElement('button');
    btnView.type = 'button';
    btnView.className = 'btn btn--outline-primary btn--small';
    btnView.textContent = 'Consulter';
    btnView.addEventListener('click', () => openDetail(record.id));
    tdActions.appendChild(btnView);

    tr.append(tdNom, tdPrenom, tdDate, tdActions);
    els.fichesTbody.appendChild(tr);
  }
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

async function openDetail(id) {
  let record;
  try {
    record = await fetchRecordById(id);
  } catch (err) {
    alert(`Impossible de charger la fiche : ${err.message}`);
    return;
  }
  currentDetailId = id;
  els.detailContent.innerHTML = buildDetailHtml(record);
  switchView('detail');
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function val(record, key) {
  const v = record[key];
  if (v === undefined || v === null || v === '') return '—';
  return escapeHtml(v);
}

function detailFieldsHtml(prefix, fields, record) {
  return fields
    .map((f) => `<dt>${escapeHtml(f.label)}</dt><dd>${val(record, `${prefix}_${f.key}`)}</dd>`)
    .join('');
}

function detailSectionHtml(section, record) {
  return `
    <div class="detail-group">
      <h3>${escapeHtml(section.number)} — ${escapeHtml(section.title)}</h3>
      <dl>${detailFieldsHtml(section.id, section.fields, record)}</dl>
    </div>`;
}

function detailMotivationsHtml(record) {
  const rows = MOTIVATIONS_ITEMS.map((item) => {
    const cells = MOTIVATIONS_COLUMNS.map((col) => {
      const checked = record[`motiv_${item.key}_${col.key}`];
      return `<td>${checked ? '✓' : ''}</td>`;
    }).join('');
    return `<tr><td>${escapeHtml(item.label)}</td>${cells}</tr>`;
  }).join('');
  const head = `<tr><th></th>${MOTIVATIONS_COLUMNS.map((c) => `<th>${escapeHtml(c.key)}</th>`).join('')}</tr>`;
  const extra = detailFieldsHtml('motivExtra', MOTIVATIONS_EXTRA_FIELDS, record);
  return `
    <div class="detail-group detail-group--wide">
      <h3>1 — Motivations majeures pour le patient</h3>
      <table class="motiv-table motiv-table--print"><thead>${head}</thead><tbody>${rows}</tbody></table>
      <dl>${extra}</dl>
    </div>`;
}

function detailAtmGridHtml(record) {
  const rows = ATM_MOVEMENTS.map((m) => {
    const cells = ATM_COLUMNS.map((c) => {
      const checked = record[`atmGrid_${m.key}_${c.key}`];
      return `<td>${checked ? '✓' : ''}</td>`;
    }).join('');
    return `<tr><td>${escapeHtml(m.label)}</td>${cells}</tr>`;
  }).join('');
  const head = `<tr><th>Mouvements</th>${ATM_COLUMNS.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')}</tr>`;
  return `<table class="atm-table atm-table--print"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
}

function detailProblemesHtml(record) {
  return `
    <div class="detail-group detail-group--wide">
      <h3>7/8 — Problèmes particuliers et médicaux</h3>
      <dl>${PROBLEMES_FIELDS.map((f) => `<dt>${escapeHtml(f.label)}</dt><dd>${val(record, f.key)}</dd>`).join('')}</dl>
    </div>`;
}

function detailManagementHtml(record) {
  const traitementLabel = MANAGEMENT.traitementOptions.find((o) => o.value === record.mgmt_traitement)?.label || '—';
  const raisonLabel = MANAGEMENT.raisonsTropTot.find((o) => o.value === record.mgmt_raisonTropTot)?.label || '';
  const checkedList = (items, prefix) =>
    items.filter((o) => record[`${prefix}_${o.key}`]).map((o) => o.label).join(', ') || '—';

  return `
    <div class="detail-group detail-group--wide">
      <h3>Management</h3>
      <dl>
        <dt>Traitement</dt><dd>${escapeHtml(traitementLabel)}${raisonLabel ? ' — ' + escapeHtml(raisonLabel) : ''}${record.mgmt_revoirEn ? ' (' + escapeHtml(record.mgmt_revoirEn) + ')' : ''}</dd>
        <dt>Rendez-vous prévus</dt><dd>${checkedList(MANAGEMENT.rdvSuivants, 'mgmt_rdv')}</dd>
        <dt>Examens nécessaires</dt><dd>${checkedList(MANAGEMENT.examensNecessaires, 'mgmt_examens')}${record.mgmt_examensAutresDetail ? ' (' + escapeHtml(record.mgmt_examensAutresDetail) + ')' : ''}</dd>
        <dt>Courrier pour</dt><dd>${checkedList(MANAGEMENT.courrierPour, 'mgmt_courrier')}${record.mgmt_courrierAutresDetail ? ' (' + escapeHtml(record.mgmt_courrierAutresDetail) + ')' : ''}</dd>
        <dt>Explications données</dt><dd>${checkedList(MANAGEMENT.explicationsDonnees, 'mgmt_explication')}</dd>
      </dl>
    </div>`;
}

function buildDetailHtml(record) {
  const identGroups = detailFieldsHtml('info', PATIENT_INFO_FIELDS, record);

  const sectionsHtml = (ids) => ids.map((id) => detailSectionHtml(SECTIONS.find((s) => s.id === id), record)).join('');

  return `
    <h1>Examen Clinique - Matrice fonctionnelle</h1>
    <div class="detail-patient">
      <div><strong>Nom :</strong> ${escapeHtml(record.nom)}</div>
      <div><strong>Prénom :</strong> ${escapeHtml(record.prenom)}</div>
      <div><strong>Date :</strong> ${formatDate(record.date)}</div>
    </div>
    <div class="detail-group detail-group--wide">
      <h3>Identification</h3>
      <dl>${identGroups}</dl>
    </div>
    ${detailMotivationsHtml(record)}
    <h2 class="section-banner">2 — Évaluation Matrice Fonctionnelle</h2>
    <div class="detail-groups">${sectionsHtml(['voiesAeriennes', 'musculature', 'habitudes', 'posture', 'mastication'])}</div>
    <h2 class="section-banner">3 — Évaluation de la denture</h2>
    <div class="detail-groups">${sectionsHtml(['occlusale', 'fonctionnelle', 'esthetique', 'clinique'])}</div>
    <h2 class="section-banner">4 — Évaluation faciale</h2>
    <div class="detail-groups">${sectionsHtml(['faciale'])}</div>
    <h2 class="section-banner">5 — Évaluation de l'ATM</h2>
    <div class="detail-group detail-group--wide">${detailAtmGridHtml(record)}<dl>${detailFieldsHtml('atm', SECTIONS.find((s) => s.id === 'atm').fields, record)}</dl></div>
    <h2 class="section-banner">6 — Évaluation de la personnalité</h2>
    <div class="detail-groups">${sectionsHtml(['personnalite'])}</div>
    ${detailProblemesHtml(record)}
    ${detailManagementHtml(record)}
    <div class="detail-group detail-group--wide">
      <h3>Degré de difficulté clinique</h3>
      <dl><dd>${val(record, 'degreDifficulteClinique')}</dd></dl>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Événements
// ---------------------------------------------------------------------------

for (const btn of els.tabs) {
  btn.addEventListener('click', () => {
    if (btn.dataset.view === 'form' && editingId === null) resetForm();
    switchView(btn.dataset.view);
    if (btn.dataset.view === 'list') renderList();
  });
}

els.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  els.formError.classList.add('hidden');
  const data = collectFormData();
  if (!data.nom || !data.prenom) return;

  try {
    if (editingId) {
      await updateRecord(editingId, data);
    } else {
      await insertRecord(data);
    }
  } catch (err) {
    els.formError.textContent = `Échec de l'enregistrement : ${err.message}`;
    els.formError.classList.remove('hidden');
    return;
  }

  editingId = null;
  resetForm();
  switchView('list');
  renderList();
});

els.btnReset.addEventListener('click', resetForm);

els.btnPrint.addEventListener('click', () => window.print());

els.btnEdit.addEventListener('click', async () => {
  let record;
  try {
    record = await fetchRecordById(currentDetailId);
  } catch (err) {
    alert(`Impossible de charger la fiche : ${err.message}`);
    return;
  }
  editingId = record.id;
  fillFormWithRecord(record);
  switchView('form');
});

els.btnDelete.addEventListener('click', async () => {
  if (!confirm('Supprimer définitivement cette fiche ?')) return;
  try {
    await deleteRecord(currentDetailId);
  } catch (err) {
    alert(`Échec de la suppression : ${err.message}`);
    return;
  }
  currentDetailId = null;
  switchView('list');
  renderList();
});

els.btnBack.addEventListener('click', () => {
  currentDetailId = null;
  switchView('list');
  renderList();
});

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------
renderForm();
resetForm();
renderList();
