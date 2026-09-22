// ============================================================================
// patient-workspace.js
// Gère la vue "parcours coordonné" d'un patient sélectionné : affichage des
// 6 espaces métiers, ouverture du formulaire de la spécialité choisie,
// et rafraîchissement de l'historique des formulaires du patient.
// Ne connaît rien de l'auth ni du dashboard-home : reçoit userId en paramètre.
// ============================================================================

import { getPatientById } from './patients.js';
import { showDashboardView } from './navigation.js';
import { SPECIALTY_FORMS, getFormDefByType, renderCheckboxForm } from './specialty-forms.js';
import { submitDynamicForm, listFormulairesForPatient, getFormulaireById } from './forms.js';
import { renderPatientHistory } from './dashboard.js';
import { formLabels } from './validation.js';
import { showFormSummaryModal } from './form-summary.js';

let currentPatient = null;

export function getCurrentPatient() {
  return currentPatient;
}

/** Ouvre le parcours coordonné d'un patient (vue 'patient' du dashboard). */
export async function openPatientWorkspace(patientId) {
  const { patient, error } = await getPatientById(patientId);
  if (error) {
    console.error('Impossible de charger le patient :', error);
    return;
  }
  currentPatient = patient;

  document.getElementById('patient-workspace-name').textContent =
    `${patient.last_name} ${patient.first_name}`;
  document.getElementById('patient-workspace-meta').textContent = patient.birth_date
    ? `Né(e) le ${new Date(patient.birth_date).toLocaleDateString('fr-FR')}`
    : '';
  document.getElementById('patient-workspace-avatar').textContent =
    `${patient.last_name?.[0] || ''}${patient.first_name?.[0] || ''}`.toUpperCase() || '—';
  document.getElementById('patient-credentials-login').textContent = patient.login || '—';
  document.getElementById('patient-credentials-password').textContent = patient.password || '—';

  const specialtiesPanel = document.getElementById('panel-specialties');
  if (specialtiesPanel) specialtiesPanel.hidden = true;

  closeSpecialtyForm();
  showDashboardView('patient');
  await refreshPatientHistory();
}

/** Ouvre le formulaire de la spécialité choisie pour le patient courant. */
export function openSpecialtyForm(specialtyKey, userId, userName) {
  const specialty = SPECIALTY_FORMS[specialtyKey];
  if (!specialty || !currentPatient) return;

  document.querySelectorAll('.specialty-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.specialty === specialtyKey);
  });

  const panel = document.getElementById('specialty-form-panel');
  const title = document.getElementById('specialty-form-title');
  const container = document.getElementById('specialty-form-container');

  title.textContent = `Consultation ${specialty.label}`;
  panel.hidden = false;

  if (!specialty.formDef) {
    container.innerHTML =
      '<p class="specialty-empty">Le formulaire de cette spécialité n\'est pas encore disponible.</p>';
    return;
  }

  container.innerHTML = renderCheckboxForm(specialty.formDef);
  const form = container.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentPatient) return;
    const formType = form.dataset.formType;
    const result = await submitDynamicForm(form, formType, userId, currentPatient.id, userName);
    if (result.success) {
      closeSpecialtyForm();
      showFormSummaryModal({
        title: `Consultation ${specialty.label}`,
        message: `${result.label} enregistré avec succès.`,
        formDef: specialty.formDef,
        data: result.data,
      });
      await refreshPatientHistory();
    }
  });
}

/** Affiche, en popup, le détail d'une consultation déjà enregistrée (historique). */
async function openFormulaireSummary(formulaireId) {
  const { formulaire, error } = await getFormulaireById(formulaireId);
  if (error || !formulaire) return;

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
}

document.getElementById('patient-history-list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-formulaire-id]');
  if (!btn) return;
  openFormulaireSummary(btn.dataset.formulaireId);
});

export function closeSpecialtyForm() {
  document.getElementById('specialty-form-panel').hidden = true;
  document.getElementById('specialty-form-container').innerHTML = '';
  document.querySelectorAll('.specialty-btn').forEach((btn) => btn.classList.remove('is-active'));
}

async function refreshPatientHistory() {
  if (!currentPatient) return;
  const { formulaires } = await listFormulairesForPatient(currentPatient.id);
  renderPatientHistory(document.getElementById('patient-history-list'), formulaires, formLabels);

  const lastConsultationEl = document.getElementById('patient-workspace-last-consultation');
  lastConsultationEl.textContent = formulaires?.[0]
    ? new Date(formulaires[0].created_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : 'Aucune';
}

document.querySelectorAll('.copy-btn[data-copy-target]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const value = document.getElementById(btn.dataset.copyTarget)?.textContent;
    if (!value || value === '—') return;
    try {
      await navigator.clipboard.writeText(value);
      btn.classList.add('is-copied');
      setTimeout(() => btn.classList.remove('is-copied'), 1200);
    } catch {
      // Copie non disponible (permissions navigateur) : on ignore silencieusement.
    }
  });
});

document.getElementById('btn-add-consultation')?.addEventListener('click', () => {
  const panel = document.getElementById('panel-specialties');
  if (!panel) return;
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
