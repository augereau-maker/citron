// ============================================================================
// auth.js
// Toute la logique Supabase Auth : connexion, inscription, déconnexion,
// récupération du profil (rôle praticien / patient).
// ============================================================================

import { supabase } from './supabase-client.js';

/**
 * Connecte un utilisateur existant.
 * @returns {{user: object}|{error: string}}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error) };
  return { user: data.user };
}

/** Déconnecte l'utilisateur courant. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  return { success: true };
}

/** Retourne la session active (ou null). */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Récupère le profil (rôle, nom) de l'utilisateur courant. */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .single();
  if (error) return { error: error.message };
  return { profile: data };
}

/** Traduit les messages d'erreur Supabase les plus courants en français. */
function translateAuthError(error) {
  const msg = error.message || '';
  if (msg.includes('Invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
  if (msg.includes('User already registered')) return 'Un compte existe déjà avec cet e-mail.';
  if (msg.includes('Password should be at least')) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (msg.includes('Email not confirmed')) return 'Merci de confirmer votre e-mail avant de vous connecter.';
  return msg || 'Une erreur est survenue, merci de réessayer.';
}
