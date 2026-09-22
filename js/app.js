// ============================================================================
// app.js
// Point d'entrée. Ne contient pas de logique métier : il orchestre les
// modules (navigation, auth, dashboard, forms) et branche les événements DOM.
// ============================================================================

import { supabase } from './supabase-client.js';
import { showScreen, showDashboardView, goToAuth, openModal, closeModal } from './navigation.js';
import { signIn, signOut, getSession, getProfile } from './auth.js';
import {
  loadPatients,
  loadLastConsultationDates,
  loadStats,
  renderPatientList,
  populatePatientAutocomplete,
} from './dashboard.js';
import { searchPatients, createPatient } from './patients.js';
import { openPatientWorkspace, openSpecialtyForm, closeSpecialtyForm } from './patient-workspace.js';
import { patientSignIn, restorePatientSession, enterPatientPortal, patientSignOut } from './patient-portal.js';
import { isAdminCredentials, adminSignIn, restoreAdminSession, enterAdminPanel, adminSignOut } from './admin.js';
import { verifyPractitionerLogin } from './practitioners.js';

let currentUser = null;
let currentProfile = null;

// Session d'un praticien provisionné par l'admin (identifiant/mot de passe,
// pas un compte Supabase Auth). Un tel praticien a le même accès complet
// (patients partagés) qu'un praticien connecté via Supabase Auth.
const PRACTITIONER_SESSION_KEY = 'citron_practitioner_session';
let customPractitionerSession = null;

function restoreCustomPractitionerSession() {
  const raw = sessionStorage.getItem(PRACTITIONER_SESSION_KEY);
  if (!raw) return false;
  try {
    customPractitionerSession = JSON.parse(raw);
    return true;
  } catch {
    sessionStorage.removeItem(PRACTITIONER_SESSION_KEY);
    return false;
  }
}

/** Id du praticien actif, quel que soit le type de compte (Supabase Auth ou provisionné par l'admin). */
function getActivePractitionerId() {
  return currentUser?.id || customPractitionerSession?.practitioner_id || null;
}

/** Nom affiché du praticien actif, à côté de la date/heure dans l'historique des consultations. */
function getActivePractitionerName() {
  return currentProfile?.full_name || customPractitionerSession?.login || null;
}

// ---------------------------------------------------------------------------
// Démarrage : vérifie s'il existe déjà une session active
// ---------------------------------------------------------------------------
async function init() {
  if (restoreAdminSession()) {
    await enterAdminPanel();
  } else if (restorePatientSession()) {
    await enterPatientPortal();
  } else if (restoreCustomPractitionerSession()) {
    await enterCustomPractitionerDashboard();
  } else {
    const session = await getSession();
    if (session) {
      await enterApp(session.user);
    } else {
      showScreen('landing');
    }
  }

  bindLandingEvents();
  bindAuthEvents();
  bindDashboardEvents();
  bindPatientPortalEvents();
  bindAdminEvents();
}

/** Charge le profil puis affiche le dashboard adapté au rôle. */
async function enterApp(user) {
  currentUser = user;
  const { profile, error } = await getProfile(user.id);
  if (error) {
    console.error('Impossible de charger le profil :', error);
  }
  currentProfile = profile || { role: 'praticien', full_name: user.email };

  document.getElementById('dashboard-user-name').textContent = currentProfile.full_name || user.email;
  document.getElementById('dashboard-user-role').textContent =
    currentProfile.role === 'praticien' ? 'Espace praticien' : 'Espace patient';

  showScreen('dashboard');
  showDashboardView('home');
  await refreshDashboardData();
}

/** Affiche le dashboard pour un praticien provisionné par l'admin (même accès complet qu'un praticien Supabase Auth). */
async function enterCustomPractitionerDashboard() {
  document.getElementById('dashboard-user-name').textContent = customPractitionerSession.login;
  document.getElementById('dashboard-user-role').textContent = 'Espace praticien';

  showScreen('dashboard');
  showDashboardView('home');
  await refreshDashboardData();
}

async function refreshDashboardData() {
  const practitionerId = getActivePractitionerId();
  if (!practitionerId) return;

  const [{ patients }, dates, stats] = await Promise.all([
    loadPatients(),
    loadLastConsultationDates(),
    loadStats(),
  ]);
  lastConsultationDates = dates;

  renderPatientList(document.getElementById('patient-list'), withLastConsultation(patients));
  populatePatientAutocomplete(patients);

  document.getElementById('stat-patients').textContent = stats.totalPatients;
  document.getElementById('stat-forms').textContent = stats.formsFilled;
}

/** Dernière consultation (date + praticien) par patient, rafraîchie avec le reste du dashboard. */
let lastConsultationDates = {};

/** Ajoute la date et le praticien de la dernière consultation connue à chaque patient. */
function withLastConsultation(patients) {
  return (patients || []).map((p) => {
    const info = lastConsultationDates[p.id];
    return { ...p, last_consultation: info?.at || null, last_practitioner: info?.practitioner || null };
  });
}

// ---------------------------------------------------------------------------
// Écran 1 : Landing
// ---------------------------------------------------------------------------
function bindLandingEvents() {
  document.querySelectorAll('[data-action="espace-praticien"]').forEach((btn) => {
    btn.addEventListener('click', () => goToAuth('praticien'));
  });
  document.querySelectorAll('[data-action="espace-patient"]').forEach((btn) => {
    btn.addEventListener('click', () => goToAuth('patient'));
  });
  bindMobileNav();
}

/** Menu mobile (hamburger) du header : ouvre/ferme le panneau nav + boutons d'espace. */
function bindMobileNav() {
  const toggle = document.getElementById('btn-nav-toggle');
  const menu = document.getElementById('site-header-menu');
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('.site-nav__link, .site-header__actions .btn').forEach((el) => {
    el.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (menu.contains(e.target) || toggle.contains(e.target)) return;
    closeMenu();
  });
}

// ---------------------------------------------------------------------------
// Écran 2 : Auth (un seul formulaire identifiant/mot de passe pour tous les
// profils : administrateur, praticien provisionné, patient, ou praticien
// Supabase Auth existant — essayés dans cet ordre à chaque tentative).
// ---------------------------------------------------------------------------
function bindAuthEvents() {
  document.getElementById('btn-back-to-landing').addEventListener('click', () => showScreen('landing'));
  bindPasswordToggles();

  const loginForm = document.getElementById('form-login');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = loginForm.identifier.value.trim();
    const password = loginForm.password.value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

    if (isAdminCredentials(identifier, password)) {
      adminSignIn();
      loginForm.reset();
      await enterAdminPanel();
      return;
    }

    const practitionerResult = await verifyPractitionerLogin(identifier, password);
    if (practitionerResult.practitioner) {
      customPractitionerSession = { ...practitionerResult.practitioner, login: identifier, password };
      sessionStorage.setItem(PRACTITIONER_SESSION_KEY, JSON.stringify(customPractitionerSession));
      loginForm.reset();
      await enterCustomPractitionerDashboard();
      return;
    }

    const patientResult = await patientSignIn(identifier, password);
    if (patientResult.patient) {
      loginForm.reset();
      await enterPatientPortal();
      return;
    }

    const result = await signIn(identifier, password);
    if (result.error) {
      errorEl.textContent = result.error;
      return;
    }
    loginForm.reset();
    await enterApp(result.user);
  });
}

/** Affiche/masque le mot de passe en clair via l'icône œil (`.password-toggle`). */
function bindPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-field').querySelector('input');
      const showIcon = btn.querySelector('.password-toggle__icon--show');
      const hideIcon = btn.querySelector('.password-toggle__icon--hide');
      const willReveal = input.type === 'password';

      input.type = willReveal ? 'text' : 'password';
      showIcon.hidden = willReveal;
      hideIcon.hidden = !willReveal;
      btn.setAttribute('aria-pressed', String(willReveal));
      btn.setAttribute('aria-label', willReveal ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
    });
  });
}

// ---------------------------------------------------------------------------
// Écran 4 : Espace Patient
// ---------------------------------------------------------------------------
function bindPatientPortalEvents() {
  document.getElementById('btn-patient-logout').addEventListener('click', () => {
    patientSignOut();
    showScreen('landing');
  });
}

// ---------------------------------------------------------------------------
// Écran 3 : Dashboard
// ---------------------------------------------------------------------------
function bindDashboardEvents() {
  document.getElementById('btn-logout').addEventListener('click', async () => {
    if (customPractitionerSession) {
      customPractitionerSession = null;
      sessionStorage.removeItem(PRACTITIONER_SESSION_KEY);
    } else {
      await signOut();
    }
    currentUser = null;
    currentProfile = null;
    showScreen('landing');
  });

  bindPatientSearchAndCreate();
  bindPatientListClicks();
  bindPatientWorkspaceNav();
  bindModalEvents();
}

// ---------------------------------------------------------------------------
// Écran 5 : Espace Administrateur
// ---------------------------------------------------------------------------
function bindAdminEvents() {
  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    adminSignOut();
    showScreen('landing');
  });
}

/** Recherche de patients (Prénom/Nom avec autocomplétion) + création d'un nouveau patient (popup). */
function bindPatientSearchAndCreate() {
  const openNewPatientBtn = document.getElementById('btn-open-new-patient');
  const newPatientForm = document.getElementById('form-new-patient');
  const searchForm = document.getElementById('form-patient-search');
  const searchResults = document.getElementById('patient-search-results');

  openNewPatientBtn.addEventListener('click', () => openModal('modal-new-patient'));

  newPatientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const practitionerId = getActivePractitionerId();
    if (!practitionerId) return;
    const feedback = document.getElementById('new-patient-feedback');
    feedback.textContent = '';

    const result = await createPatient(practitionerId, {
      firstName: newPatientForm.fieldA.value,
      lastName: newPatientForm.fieldB.value,
      birthDate: newPatientForm.fieldC.value,
    });

    if (result.error) {
      feedback.textContent = result.error;
      feedback.className = 'form-feedback is-error';
      return;
    }

    feedback.textContent = 'Patient créé.';
    feedback.className = 'form-feedback is-success';
    newPatientForm.reset();
    closeModal('modal-new-patient');
    await refreshDashboardData();
  });

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { patients } = await searchPatients({
      firstName: searchForm.queryA.value,
      lastName: searchForm.queryB.value,
    });
    renderPatientList(searchResults, withLastConsultation(patients));
  });
}

/** Ferme toute popup ouverte : clic sur [data-modal-close], clic hors de la carte, ou touche Échap. */
function bindModalEvents() {
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay:not([hidden])').forEach((overlay) => closeModal(overlay.id));
  });
}

/** Un clic sur une ligne patient (résultats de recherche ou liste complète) ouvre son parcours. */
function bindPatientListClicks() {
  ['patient-search-results', 'patient-list'].forEach((containerId) => {
    document.getElementById(containerId).addEventListener('click', (e) => {
      const btn = e.target.closest('[data-patient-id]');
      if (!btn) return;
      openPatientWorkspace(btn.dataset.patientId);
    });
  });
}

/** Navigation dans le parcours coordonné : retour à l'accueil, choix d'une spécialité. */
function bindPatientWorkspaceNav() {
  document.getElementById('btn-back-to-dashboard-home').addEventListener('click', () => {
    closeSpecialtyForm();
    showDashboardView('home');
  });

  document.getElementById('btn-close-specialty-form').addEventListener('click', closeSpecialtyForm);

  document.querySelectorAll('.specialty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const practitionerId = getActivePractitionerId();
      if (!practitionerId) return;
      openSpecialtyForm(btn.dataset.specialty, practitionerId, getActivePractitionerName());
    });
  });
}

// ---------------------------------------------------------------------------
// Réagit aussi aux changements de session déclenchés ailleurs (autre onglet…)
// ---------------------------------------------------------------------------
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    currentUser = null;
    currentProfile = null;
    showScreen('landing');
  }
});

init();
