// ============================================================================
// forms.js
// Lit un formulaire HTML, le valide avec Zod (validation.js), puis l'envoie
// dans la table `formulaires` (colonne JSONB) via Supabase.
// Ne connaît rien du dashboard : réutilisable pour n'importe quel formulaire.
// ============================================================================

import { supabase } from './supabase-client.js';
import { validateForm, formLabels } from './validation.js';

/**
 * Lit les champs d'un <form> et les convertit en objet simple.
 * Les cases à cocher deviennent des booléens.
 */
function formToObject(formEl) {
  const formData = new FormData(formEl);
  const obj = {};
  for (const [key, value] of formData.entries()) {
    obj[key] = value;
  }
  formEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    obj[cb.name] = cb.checked;
  });
  return obj;
}

/** Affiche les erreurs de validation sous chaque champ concerné. */
function displayErrors(formEl, errors) {
  formEl.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
  Object.entries(errors).forEach(([field, message]) => {
    const target = formEl.querySelector(`[data-error-for="${field}"]`);
    if (target) target.textContent = message;
    else {
      const globalError = formEl.querySelector('[data-error-for="_global"]');
      if (globalError) globalError.textContent = message;
    }
  });
}

/**
 * Valide puis envoie un formulaire vers Supabase.
 * @param {HTMLFormElement} formEl
 * @param {string} formType clé correspondant à validation.js (ex: 'anamnese')
 * @param {string} userId id du praticien connecté
 * @param {string|null} patientId id du patient concerné (optionnel)
 * @param {string|null} practitionerName nom affiché à côté de la date/heure dans l'historique
 */
export async function submitDynamicForm(formEl, formType, userId, patientId = null, practitionerName = null) {
  const rawData = formToObject(formEl);
  const result = validateForm(formType, rawData);

  if (!result.success) {
    displayErrors(formEl, result.errors);
    return { success: false };
  }

  const { error } = await supabase.from('formulaires').insert({
    user_id: userId,
    patient_id: patientId,
    form_type: formType,
    form_data: result.data,
    practitioner_name: practitionerName,
  });

  if (error) {
    displayErrors(formEl, { _global: `Échec de l'enregistrement : ${error.message}` });
    return { success: false };
  }

  displayErrors(formEl, {});
  formEl.reset();
  return { success: true, label: formLabels[formType] || formType, data: result.data };
}

/** Récupère l'historique des formulaires remplis par le praticien connecté. */
export async function listFormulaires(userId) {
  const { data, error } = await supabase
    .from('formulaires')
    .select('id, form_type, form_data, created_at, patient_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { formulaires: data };
}

/** Récupère un formulaire précis (données complètes) par id. */
export async function getFormulaireById(formulaireId) {
  const { data, error } = await supabase
    .from('formulaires')
    .select('id, form_type, form_data, created_at, patient_id, practitioner_name')
    .eq('id', formulaireId)
    .single();

  if (error) return { error: error.message };
  return { formulaire: data };
}

/** Récupère l'historique des formulaires d'un patient précis (tous praticiens confondus). */
export async function listFormulairesForPatient(patientId) {
  const { data, error } = await supabase
    .from('formulaires')
    .select('id, form_type, created_at, practitioner_name')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { formulaires: data };
}
