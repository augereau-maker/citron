// ============================================================================
// specialty-forms.js
// Rendu générique d'un formulaire "à groupes de cases à cocher" (comme celui
// de l'orthodontiste). Réutilisable pour toute future spécialité : il suffit
// de créer un fichier `xxx-fields.js` sur le même modèle que
// orthodontie-fields.js et de l'ajouter au registre SPECIALTY_FORMS ci-dessous.
// ============================================================================

import { orthodontieForm } from './orthodontie-fields.js';

/**
 * Registre des espaces métiers.
 * `formDef: null` = formulaire pas encore développé (affiche un message).
 */
export const SPECIALTY_FORMS = {
  orthodontiste: { label: 'Orthodontie', formDef: orthodontieForm },
  kine: { label: 'Kinésithérapeute', formDef: null },
  orthophoniste: { label: 'Orthophoniste', formDef: null },
  orl: { label: 'ORL', formDef: null },
  allergologue: { label: 'Allergologue', formDef: null },
  osteopathe: { label: 'Ostéopathe', formDef: null },
  dentiste: { label: 'Chirurgien-Dentiste', formDef: null },
};

/** Retrouve la définition d'un formulaire (groupes de cases à cocher) à partir de son `form_type`. */
export function getFormDefByType(formType) {
  return Object.values(SPECIALTY_FORMS).find((s) => s.formDef?.formType === formType)?.formDef || null;
}

/** Construit le HTML d'un champ hors case-à-cocher (radio ou texte) déclaré dans `formDef.fields`. */
function renderField(field) {
  const requiredAttr = field.required ? ' required' : '';
  const requiredMark = field.required ? ' <span class="required-mark">*</span>' : '';

  if (field.type === 'radio') {
    const optionsHtml = field.options
      .map(
        ([value, label]) => `
        <label class="radio-choice">
          <input type="radio" name="${field.key}" value="${escapeHtml(value)}"${requiredAttr} />
          <span>${escapeHtml(label)}</span>
        </label>`
      )
      .join('');
    return `
      <div class="field-block">
        <span class="field-block__label">${escapeHtml(field.label)}${requiredMark}</span>
        <div class="radio-row">${optionsHtml}</div>
        <p class="field-error" data-error-for="${field.key}"></p>
      </div>`;
  }

  return `
    <label class="field-block">
      <span class="field-block__label">${escapeHtml(field.label)}${requiredMark}</span>
      <input type="text" name="${field.key}"${requiredAttr} />
      <p class="field-error" data-error-for="${field.key}"></p>
    </label>`;
}

/**
 * Construit le HTML d'un formulaire à cases à cocher à partir d'une
 * définition (voir orthodontie-fields.js pour le format attendu).
 */
export function renderCheckboxForm(formDef) {
  const fieldsHtml = formDef.fields?.length
    ? `<fieldset class="checkbox-group">${formDef.fields.map(renderField).join('')}</fieldset>`
    : '';

  const groupsHtml = formDef.groups
    .map((group) => {
      const itemsHtml = group.items
        .map(([key, label]) => {
          const fieldName = `${group.id}_${key}`;
          return `
          <label class="checkbox-item">
            <input type="checkbox" name="${fieldName}" />
            <span>${escapeHtml(label)}</span>
          </label>`;
        })
        .join('');
      return `
        <fieldset class="checkbox-group">
          <legend>${escapeHtml(group.title)}</legend>
          <div class="checkbox-grid">${itemsHtml}</div>
        </fieldset>`;
    })
    .join('');

  return `
    <form class="dyn-form specialty-form" data-form-type="${formDef.formType}">
      ${fieldsHtml}
      ${groupsHtml}
      <p class="field-error" data-error-for="_global"></p>
      <p class="form-feedback" data-role="feedback"></p>
      <button type="submit" class="btn btn--primary">Enregistrer le bilan</button>
    </form>`;
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
