// ============================================================================
// form-summary.js
// Rendu du résumé d'un formulaire rempli : cases cochées groupées par section
// (formulaires à groupes de cases à cocher), ou liste générique "champ : valeur"
// pour tout autre type de formulaire. Partagé entre l'Espace Praticien
// (patient-workspace.js) et l'Espace Patient (patient-portal.js), qui affichent
// tous deux ce résumé dans la même popup (#modal-form-summary).
// ============================================================================

import { openModal } from './navigation.js';

/** Remplit et ouvre la popup de résumé de formulaire (#modal-form-summary). */
export function showFormSummaryModal({ title, message, messageClass = 'form-feedback is-success', formDef, data }) {
  document.getElementById('form-summary-title').textContent = title;
  const messageEl = document.getElementById('form-summary-confirmation');
  messageEl.textContent = message || '';
  messageEl.className = messageClass;

  document.getElementById('form-summary-content').innerHTML = renderFormSummaryContent(formDef, data);
  openModal('modal-form-summary');
}

/** Cases cochées groupées par section (formulaire à groupes), ou liste générique des champs renseignés sinon. */
export function renderFormSummaryContent(formDef, data) {
  if (formDef?.groups) {
    const fieldsHtml = (formDef.fields || [])
      .filter((f) => data?.[f.key] !== undefined && data?.[f.key] !== '')
      .map((f) => {
        const rawValue = data[f.key];
        const value = f.type === 'radio' ? f.options.find(([v]) => v === rawValue)?.[1] || rawValue : rawValue;
        return `<li><strong>${escapeHtml(f.label)} :</strong> ${escapeHtml(String(value))}</li>`;
      })
      .join('');

    const sectionsHtml = formDef.groups
      .map((group) => {
        const checkedItems = group.items.filter(([key]) => data?.[`${group.id}_${key}`] === true);
        if (checkedItems.length === 0) return '';
        const itemsHtml = checkedItems.map(([, label]) => `<li>${escapeHtml(label)}</li>`).join('');
        return `
        <div class="form-summary__group">
          <h3>${escapeHtml(group.title)}</h3>
          <ul>${itemsHtml}</ul>
        </div>`;
      })
      .join('');

    const fieldsBlock = fieldsHtml ? `<div class="form-summary__group"><ul>${fieldsHtml}</ul></div>` : '';
    return fieldsBlock + sectionsHtml || '<p class="empty-state">Aucun item coché.</p>';
  }

  const entries = Object.entries(data || {}).filter(([, value]) => value !== '' && value !== false && value != null);
  if (entries.length === 0) return '<p class="empty-state">Aucune information renseignée.</p>';
  const itemsHtml = entries.map(([key, value]) => `<li><strong>${escapeHtml(key)} :</strong> ${escapeHtml(String(value))}</li>`).join('');
  return `<div class="form-summary__group"><ul>${itemsHtml}</ul></div>`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}
