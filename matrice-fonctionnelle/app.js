import { FIELD_GROUPS } from './fields.js';
import { supabase } from '../js/supabase-client.js';

const TABLE = 'matrice_fonctionnelle';

const els = {
  tabs: document.querySelectorAll('.tab-btn'),
  views: {
    form: document.getElementById('view-form'),
    list: document.getElementById('view-list'),
    detail: document.getElementById('view-detail'),
  },
  formGroups: document.getElementById('form-groups'),
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

function switchView(name) {
  for (const [key, el] of Object.entries(els.views)) {
    el.classList.toggle('hidden', key !== name);
  }
  for (const btn of els.tabs) {
    btn.classList.toggle('active', btn.dataset.view === name);
  }
}

function renderFormGroups() {
  els.formGroups.innerHTML = '';
  for (const group of FIELD_GROUPS) {
    if (group.id === 'general') continue; // rendu dans son propre fieldset plus haut si besoin
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'group-block';
    const legend = document.createElement('legend');
    legend.textContent = group.title;
    fieldset.appendChild(legend);
    for (const field of group.fields) {
      fieldset.appendChild(buildSelectField(group.id, field));
    }
    els.formGroups.appendChild(fieldset);
  }
  // Le groupe "general" est rendu en premier, avant les 4 colonnes.
  const generalGroup = FIELD_GROUPS.find((g) => g.id === 'general');
  if (generalGroup) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'group-block group-general';
    const legend = document.createElement('legend');
    legend.textContent = generalGroup.title;
    fieldset.appendChild(legend);
    for (const field of generalGroup.fields) {
      fieldset.appendChild(buildSelectField(generalGroup.id, field));
    }
    els.formGroups.prepend(fieldset);
  }
}

function buildSelectField(groupId, field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const id = `field-${groupId}-${field.key}`;
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = field.label;
  const select = document.createElement('select');
  select.id = id;
  select.name = `${groupId}_${field.key}`;
  for (const opt of field.options) {
    const optionEl = document.createElement('option');
    optionEl.value = opt;
    optionEl.textContent = opt;
    select.appendChild(optionEl);
  }
  wrapper.appendChild(label);
  wrapper.appendChild(select);
  return wrapper;
}

function collectFormData() {
  const data = {
    nom: document.getElementById('input-nom').value.trim(),
    prenom: document.getElementById('input-prenom').value.trim(),
    date: document.getElementById('input-date').value,
  };
  for (const group of FIELD_GROUPS) {
    for (const field of group.fields) {
      const name = `${group.id}_${field.key}`;
      const el = els.form.elements.namedItem(name);
      data[name] = el ? el.value : '';
    }
  }
  return data;
}

function fillFormWithRecord(record) {
  document.getElementById('input-nom').value = record.nom || '';
  document.getElementById('input-prenom').value = record.prenom || '';
  document.getElementById('input-date').value = record.date || '';
  for (const group of FIELD_GROUPS) {
    for (const field of group.fields) {
      const name = `${group.id}_${field.key}`;
      const el = els.form.elements.namedItem(name);
      if (el && record[name] !== undefined) el.value = record[name];
    }
  }
}

function resetForm() {
  els.form.reset();
  document.getElementById('input-date').value = new Date().toISOString().slice(0, 10);
  editingId = null;
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
    btnView.className = 'btn btn-small';
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

function buildDetailHtml(record) {
  let html = `
    <h1>Évaluation Matrice Fonctionnelle</h1>
    <div class="detail-patient">
      <div><strong>Nom :</strong> ${escapeHtml(record.nom)}</div>
      <div><strong>Prénom :</strong> ${escapeHtml(record.prenom)}</div>
      <div><strong>Date :</strong> ${formatDate(record.date)}</div>
    </div>
  `;
  html += '<div class="detail-groups">';
  for (const group of FIELD_GROUPS) {
    html += `<div class="detail-group"><h2>${escapeHtml(group.title)}</h2><dl>`;
    for (const field of group.fields) {
      const name = `${group.id}_${field.key}`;
      html += `<dt>${escapeHtml(field.label)}</dt><dd>${escapeHtml(record[name] ?? '')}</dd>`;
    }
    html += '</dl></div>';
  }
  html += '</div>';
  return html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// --- Événements ---

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

// --- Initialisation ---
renderFormGroups();
resetForm();
renderList();
