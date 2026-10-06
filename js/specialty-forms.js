// ============================================================================
// specialty-forms.js
// Rendu générique d'un formulaire "à groupes de cases à cocher" (comme celui
// de l'orthodontiste). Réutilisable pour toute future spécialité : il suffit
// de créer un fichier `xxx-fields.js` sur le même modèle que
// orthodontie-fields.js et de l'ajouter au registre SPECIALTY_FORMS ci-dessous.
// ============================================================================

import { orthodontieForm } from './orthodontie-fields.js';
import { kineForm } from './kine-fields.js';
import { orthophonieForm } from './orthophonie-fields.js';
import { groupFieldName } from './form-def-utils.js';

/**
 * Registre des espaces métiers.
 * `formDef: null` = formulaire pas encore développé (affiche un message).
 */
export const SPECIALTY_FORMS = {
  orthodontiste: { label: 'Orthodontie', formDef: orthodontieForm },
  kine: { label: 'Kinésithérapeute', formDef: kineForm },
  orthophoniste: { label: 'Orthophoniste', formDef: orthophonieForm },
  orl: { label: 'ORL', formDef: null },
  allergologue: { label: 'Allergologue', formDef: null },
  osteopathe: { label: 'Ostéopathe', formDef: null },
  dentiste: { label: 'Chirurgien-Dentiste', formDef: null },
};

/** Retrouve la définition d'un formulaire (groupes de cases à cocher) à partir de son `form_type`. */
export function getFormDefByType(formType) {
  return Object.values(SPECIALTY_FORMS).find((s) => s.formDef?.formType === formType)?.formDef || null;
}

/** Construit le HTML d'un champ hors case-à-cocher (radio, texte ou zone de texte), `name` = nom HTML du champ. */
function renderField(field, name = field.key) {
  const requiredAttr = field.required ? ' required' : '';
  const requiredMark = field.required ? ' <span class="required-mark">*</span>' : '';

  if (field.type === 'radio') {
    const optionsHtml = field.options
      .map(
        ([value, label]) => `
        <label class="radio-choice">
          <input type="radio" name="${name}" value="${escapeHtml(value)}"${requiredAttr} />
          <span>${escapeHtml(label)}</span>
        </label>`
      )
      .join('');
    return `
      <div class="field-block">
        <span class="field-block__label">${escapeHtml(field.label)}${requiredMark}</span>
        <div class="radio-row">${optionsHtml}</div>
        <p class="field-error" data-error-for="${name}"></p>
      </div>`;
  }

  const control =
    field.type === 'textarea'
      ? `<textarea name="${name}" rows="4"${requiredAttr}></textarea>`
      : `<input type="text" name="${name}"${requiredAttr}${field.defaultValue ? ` value="${escapeHtml(field.defaultValue)}"` : ''} />`;
  return `
    <label class="field-block">
      <span class="field-block__label">${escapeHtml(field.label)}${requiredMark}</span>
      ${control}
      <p class="field-error" data-error-for="${name}"></p>
    </label>`;
}

/** Tableau de cases à cocher (lignes × colonnes) déclaré dans `group.matrix`. */
function renderMatrix(group) {
  const { columns, rows } = group.matrix;
  const headHtml = columns.map(([, label]) => `<th scope="col">${escapeHtml(label)}</th>`).join('');
  const rowsHtml = rows
    .map(([rowKey, rowLabel]) => {
      const cells = columns
        .map(
          ([colKey, colLabel]) => `
          <td><input type="checkbox" name="${group.id}_${rowKey}_${colKey}" aria-label="${escapeHtml(`${rowLabel} — ${colLabel}`)}" /></td>`
        )
        .join('');
      return `<tr><th scope="row">${escapeHtml(rowLabel)}</th>${cells}</tr>`;
    })
    .join('');
  return `
    <div class="matrix-wrap">
      <table class="matrix-table">
        <thead><tr><th></th>${headHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

/**
 * Construit le HTML d'un formulaire à cases à cocher à partir d'une
 * définition (voir orthodontie-fields.js pour le format attendu).
 */
export function renderCheckboxForm(formDef) {
  const fieldsHtml = formDef.fields?.length
    ? `<fieldset class="checkbox-group">${formDef.fields.map((field) => renderField(field)).join('')}</fieldset>`
    : '';

  const groupsHtml = formDef.groups
    .map((group) => {
      const groupFieldsHtml = (group.fields || [])
        .map((field) => renderField(field, groupFieldName(group, field)))
        .join('');
      const matrixHtml = group.matrix ? renderMatrix(group) : '';
      const itemsHtml = (group.items || [])
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
          ${groupFieldsHtml}
          ${matrixHtml}
          ${itemsHtml ? `<div class="checkbox-grid">${itemsHtml}</div>` : ''}
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
