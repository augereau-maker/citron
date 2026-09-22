// ============================================================================
// navigation.js
// Gère uniquement la bascule entre les écrans (Landing / Auth / Dashboard).
// Ne contient aucune logique Supabase : reçoit des données déjà prêtes.
// ============================================================================

const screens = {
  landing: document.getElementById('screen-landing'),
  auth: document.getElementById('screen-auth'),
  dashboard: document.getElementById('screen-dashboard'),
  'patient-portal': document.getElementById('screen-patient-portal'),
  admin: document.getElementById('screen-admin'),
};

/**
 * Affiche un écran et masque les autres.
 * @param {'landing'|'auth'|'dashboard'|'patient-portal'|'admin'} name
 */
export function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    el.hidden = key !== name;
  });
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/**
 * Bascule entre les deux vues internes du Dashboard :
 * 'home' (recherche/liste patients, plan du jour) et
 * 'patient' (parcours coordonné du patient sélectionné).
 * @param {'home'|'patient'} view
 */
export function showDashboardView(view) {
  const home = document.getElementById('dashboard-home');
  const patient = document.getElementById('dashboard-patient');
  if (home) home.hidden = view !== 'home';
  if (patient) patient.hidden = view !== 'patient';
}

/**
 * Affiche l'écran d'authentification (un seul formulaire identifiant/mot de
 * passe, valable pour praticien, patient ou administrateur) en adaptant
 * uniquement le message d'introduction selon l'espace visé depuis la landing.
 * @param {'praticien'|'patient'} role
 */
export function goToAuth(role = 'praticien') {
  const intro = document.getElementById('auth-intro');
  if (intro) {
    intro.textContent =
      role === 'praticien'
        ? 'Connectez-vous à votre espace professionnel CITRON.'
        : 'Connectez-vous avec les codes remis par votre praticien.';
  }

  showScreen('auth');
}

/** Ouvre une popup (id d'un `.modal-overlay`). */
export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = false;
}

/** Ferme une popup (id d'un `.modal-overlay`). */
export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = true;
}
