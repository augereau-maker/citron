// ============================================================================
// patient-portal.js
// Gère l'Espace Patient : connexion par identifiant/mot de passe (générés par
// le praticien à la création de la fiche patient), persistance de session
// (sessionStorage, car il ne s'agit pas d'une session Supabase Auth), et
// consultation en lecture seule des formulaires remplis par les praticiens.
// ============================================================================

import { verifyPatientLogin, listPatientFormulaires } from './patients.js';
import { showScreen } from './navigation.js';
import { getFormDefByType } from './specialty-forms.js';
import { formLabels } from './validation.js';
import { showFormSummaryModal } from './form-summary.js';

const SESSION_KEY = 'citron_patient_session';

let currentSession = null;
let currentFormulaires = [];

/** Tente de connecter un patient avec son identifiant/mot de passe. */
export async function patientSignIn(login, password) {
  const { patient, error } = await verifyPatientLogin(login, password);
  if (error) return { error };

  currentSession = { ...patient, login, password };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
  return { patient: currentSession };
}

/** Restaure une session patient déjà active (ex. rechargement de page). */
export function restorePatientSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    currentSession = JSON.parse(raw);
    return currentSession;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/** Déconnecte le patient courant. */
export function patientSignOut() {
  currentSession = null;
  currentFormulaires = [];
  sessionStorage.removeItem(SESSION_KEY);
}

/** Affiche l'Espace Patient pour la session en cours. */
export async function enterPatientPortal() {
  if (!currentSession) return;
  document.getElementById('patient-portal-name').textContent =
    `${currentSession.first_name} ${currentSession.last_name}`;
  showScreen('patient-portal');
  await refreshPatientPortalList();
}

async function refreshPatientPortalList() {
  const { formulaires, error } = await listPatientFormulaires(
    currentSession.patient_id,
    currentSession.login,
    currentSession.password
  );
  currentFormulaires = formulaires || [];

  const container = document.getElementById('patient-portal-list');
  if (error || currentFormulaires.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune consultation enregistrée pour le moment.</p>';
    return;
  }

  container.innerHTML = currentFormulaires
    .map((f) => {
      const label = formLabels[f.form_type] || f.form_type;
      const date = new Date(f.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      const meta = f.practitioner_name ? `${date} · ${f.practitioner_name}` : date;
      return `
      <li>
        <button type="button" class="patient-row is-clickable" data-formulaire-id="${f.id}">
          <span class="patient-name">${escapeHtml(label)}</span>
          <span class="patient-meta">${escapeHtml(meta)}</span>
        </button>
      </li>`;
    })
    .join('');
}

document.getElementById('patient-portal-list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-formulaire-id]');
  if (!btn) return;
  const formulaire = currentFormulaires.find((f) => f.id === btn.dataset.formulaireId);
  if (!formulaire) return;

  const label = formLabels[formulaire.form_type] || formulaire.form_type;
  const date = new Date(formulaire.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const message = formulaire.practitioner_name
    ? `Consultation du ${date} · ${formulaire.practitioner_name}`
    : `Consultation du ${date}`;

  showFormSummaryModal({
    title: label,
    message,
    messageClass: 'form-feedback',
    formDef: getFormDefByType(formulaire.form_type),
    data: formulaire.form_data,
  });
});

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}
