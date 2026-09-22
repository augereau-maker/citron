// ============================================================================
// patients.js
// Recherche, création et lecture des fiches patients d'un praticien.
// Aucune logique d'affichage ici : uniquement les appels Supabase.
// ============================================================================

import { supabase } from './supabase-client.js';

/**
 * Recherche parmi tous les patients (partagés entre tous les praticiens) par
 * prénom et/ou nom. Champs vides = retourne tous les patients.
 */
export async function searchPatients({ firstName = '', lastName = '' } = {}) {
  let builder = supabase
    .from('patients')
    .select('id, first_name, last_name, birth_date')
    .order('last_name', { ascending: true });

  const safeFirst = firstName.trim().replace(/[%_]/g, '');
  const safeLast = lastName.trim().replace(/[%_]/g, '');
  if (safeFirst) builder = builder.ilike('first_name', `%${safeFirst}%`);
  if (safeLast) builder = builder.ilike('last_name', `%${safeLast}%`);

  const { data, error } = await builder;
  if (error) return { error: error.message };
  return { patients: data };
}

/**
 * Crée un nouveau patient rattaché au praticien connecté, avec des codes
 * d'accès générés automatiquement pour l'Espace Patient (identifiant =
 * prénom + 5 chiffres, mot de passe = 6 lettres). Réessaie en cas de
 * collision d'identifiant (très rare, contrainte unique en base).
 */
export async function createPatient(practitionerId, { firstName, lastName, birthDate }) {
  if (!firstName?.trim() || !lastName?.trim()) {
    return { error: 'Le prénom et le nom sont obligatoires.' };
  }

  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        practitioner_id: practitionerId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate || null,
        login: generatePatientLogin(firstName),
        password: generatePatientPassword(),
      })
      .select('id, first_name, last_name, birth_date, login, password')
      .single();

    if (!error) return { patient: data };
    if (error.code !== '23505') return { error: error.message };
    // Collision sur l'identifiant unique : on retente avec un nouveau suffixe.
  }

  return { error: "Impossible de générer un identifiant patient unique, merci de réessayer." };
}

/** Retourne un identifiant patient : prénom (sans accents/espaces) + 5 chiffres aléatoires. */
function generatePatientLogin(firstName) {
  const base = firstName
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
  const suffix = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `${base}${suffix}`;
}

/** Retourne un mot de passe patient : 6 lettres aléatoires (sans I/O, ambigus à l'écrit). */
function generatePatientPassword() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let password = '';
  for (let i = 0; i < 6; i++) password += letters[Math.floor(Math.random() * letters.length)];
  return password;
}

/** Récupère une fiche patient par id (avec ses codes d'accès Espace Patient). */
export async function getPatientById(patientId) {
  const { data, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name, birth_date, login, password')
    .eq('id', patientId)
    .single();
  if (error) return { error: error.message };
  return { patient: data };
}

/** Vérifie les identifiants d'un patient (Espace Patient) via une fonction RPC sécurisée. */
export async function verifyPatientLogin(login, password) {
  const { data, error } = await supabase.rpc('verify_patient_login', {
    p_login: login,
    p_password: password,
  });
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: 'Identifiant ou mot de passe incorrect.' };
  return { patient: data[0] };
}

/** Liste les formulaires remplis pour un patient (Espace Patient) via une fonction RPC sécurisée. */
export async function listPatientFormulaires(patientId, login, password) {
  const { data, error } = await supabase.rpc('patient_formulaires', {
    p_patient_id: patientId,
    p_login: login,
    p_password: password,
  });
  if (error) return { error: error.message };
  return { formulaires: data };
}
