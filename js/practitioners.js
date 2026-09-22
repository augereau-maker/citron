// ============================================================================
// practitioners.js
// Comptes praticien provisionnés par l'administrateur (identifiant + mot de
// passe généré, pas un compte Supabase Auth) : vérification de connexion.
// Une fois connecté, ce praticien a le même accès complet aux patients que
// n'importe quel praticien (voir patients.js / dashboard.js, partagés entre
// tous). Aucune logique d'affichage ici.
// ============================================================================

import { supabase } from './supabase-client.js';

/** Vérifie les identifiants d'un praticien provisionné via une fonction RPC sécurisée. */
export async function verifyPractitionerLogin(login, password) {
  const { data, error } = await supabase.rpc('verify_practitioner_login', {
    p_login: login,
    p_password: password,
  });
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: 'Identifiant ou mot de passe incorrect.' };
  return { practitioner: data[0] };
}
