// ============================================================================
// validation.js
// Schémas Zod pour chaque type de formulaire (form_type) stocké en JSONB.
// Ajouter un nouveau formulaire = ajouter une entrée dans `schemas`,
// sans toucher au reste de l'application.
// ============================================================================

import { z } from 'https://cdn.jsdelivr.net/npm/zod@3/+esm';
import { orthodontieForm, flatFieldKeys } from './orthodontie-fields.js';

// --- Formulaire "Orthodontiste" (généré depuis orthodontie-fields.js) ------
// Toutes les cases sont optionnelles et valent `false` par défaut : cocher
// une case correspond simplement à mettre son booléen à `true` avant envoi.
const orthodontieSchemaShape = Object.fromEntries(
  flatFieldKeys(orthodontieForm).map((key) => [key, z.boolean().optional().default(false)])
);
const orthodontieSchema = z.object({
  ...orthodontieSchemaShape,
  traitementDebute: z.enum(['oui', 'non'], {
    errorMap: () => ({ message: 'Merci d’indiquer si un traitement a débuté.' }),
  }),
  traitementType: z.string().min(1, 'Merci de préciser le type de traitement.'),
});

// --- Formulaire "Anamnèse" (première évaluation d'un patient) --------------
const anamneseSchema = z.object({
  motifConsultation: z.string().min(3, 'Le motif de consultation est trop court.'),
  ronflementNocturne: z.enum(['jamais', 'occasionnel', 'frequent'], {
    errorMap: () => ({ message: 'Merci de sélectionner une fréquence.' }),
  }),
  respirationBuccale: z.boolean(),
  antecedentsORL: z.string().optional().default(''),
  poidsKg: z.coerce.number().positive('Le poids doit être un nombre positif.').max(150),
  tailleCm: z.coerce.number().positive('La taille doit être un nombre positif.').max(220),
});

// --- Formulaire "Suivi orthophonique" ---------------------------------------
const suiviOrthoSchema = z.object({
  dateSeance: z.string().min(1, 'La date est requise.'),
  toniciteLinguale: z.enum(['faible', 'moyenne', 'bonne']),
  exercicesRealises: z.string().min(3, 'Merci de décrire les exercices réalisés.'),
  observations: z.string().optional().default(''),
});

// --- Formulaire "Plan de soins ODF/ORL" -------------------------------------
const planSoinsSchema = z.object({
  typeAppareil: z.string().min(2, 'Merci de préciser le type d’appareil.'),
  dateDebutTraitement: z.string().min(1, 'La date de début est requise.'),
  dureeEstimeeMois: z.coerce.number().int().positive().max(60),
  remarques: z.string().optional().default(''),
});

export const schemas = {
  anamnese: anamneseSchema,
  suivi_ortho: suiviOrthoSchema,
  plan_soins: planSoinsSchema,
  orthodontie: orthodontieSchema,
};

export const formLabels = {
  anamnese: 'Anamnèse initiale',
  suivi_ortho: 'Suivi orthophonique',
  plan_soins: 'Plan de soins ODF / ORL',
  orthodontie: 'Bilan orthodontique initial',
};

/**
 * Valide `data` selon le `formType` donné.
 * @returns {{success: true, data: object} | {success: false, errors: Record<string,string>}}
 */
export function validateForm(formType, data) {
  const schema = schemas[formType];
  if (!schema) {
    return { success: false, errors: { _global: `Type de formulaire inconnu : ${formType}` } };
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_global';
    errors[key] = issue.message;
  }
  return { success: false, errors };
}
