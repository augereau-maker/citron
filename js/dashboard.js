// ============================================================================
// dashboard.js
// Charge et affiche les données du Dashboard Praticien : liste des patients,
// statistiques, plan du jour. N'importe aucune logique d'auth ou de forms.
// ============================================================================

import { supabase } from './supabase-client.js';

/** Charge tous les patients (partagés entre tous les praticiens). */
export async function loadPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name, birth_date, created_at')
    .order('last_name', { ascending: true });
  if (error) return { error: error.message };
  return { patients: data };
}

/** Charge les rendez-vous du jour pour le praticien connecté. */
export async function loadTodayAppointments(practitionerId) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('appointments')
    .select('id, appointment_time, notes, status, patients(first_name, last_name)')
    .eq('practitioner_id', practitionerId)
    .eq('appointment_date', today)
    .order('appointment_time', { ascending: true });
  if (error) return { error: error.message };
  return { appointments: data };
}

/** Assemble les indicateurs affichés en haut du dashboard (partagés entre tous les praticiens). */
export async function loadStats() {
  const { patients } = await loadPatients();

  const { count: formsCount } = await supabase
    .from('formulaires')
    .select('id', { count: 'exact', head: true });

  return {
    totalPatients: patients?.length ?? 0,
    formsFilled: formsCount ?? 0,
  };
}

/** Charge la date et le praticien de la dernière consultation (formulaire le plus récent) de chaque patient. */
export async function loadLastConsultationDates() {
  const { data, error } = await supabase
    .from('formulaires')
    .select('patient_id, created_at, practitioner_name')
    .order('created_at', { ascending: false });
  if (error || !data) return {};

  const dates = {};
  for (const f of data) {
    if (f.patient_id && !dates[f.patient_id]) {
      dates[f.patient_id] = { at: f.created_at, practitioner: f.practitioner_name || null };
    }
  }
  return dates;
}

/** Rendu HTML de la liste de patients (cliquables) en tableau Prénom et Nom / Date de naissance / Dernière consultation. */
export function renderPatientList(container, patients) {
  if (!patients || patients.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucun patient enregistré pour l’instant.</p>';
    return;
  }

  const header = `
    <li class="patient-row patient-row--header" aria-hidden="true">
      <span class="patient-col patient-col--name">Prénom et Nom</span>
      <span class="patient-col patient-col--birth">Date de naissance</span>
      <span class="patient-col patient-col--consult">Dernière consultation</span>
      <span class="patient-col patient-col--practitioner">Dernier Praticien</span>
      <span class="patient-col patient-col--arrow"></span>
    </li>`;

  const rows = patients
    .map((p) => {
      const fullName = `${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}`;
      return `
      <li>
        <button type="button" class="patient-row is-clickable" data-patient-id="${p.id}" aria-label="Ouvrir le dossier de ${fullName}">
          <span class="patient-col patient-col--name patient-name">${fullName}</span>
          <span class="patient-col patient-col--birth">${p.birth_date ? formatDate(p.birth_date) : '—'}</span>
          <span class="patient-col patient-col--consult">${p.last_consultation ? formatDate(p.last_consultation) : '—'}</span>
          <span class="patient-col patient-col--practitioner">${escapeHtml(p.last_practitioner || '—')}</span>
          <span class="patient-col patient-col--arrow" aria-hidden="true">›</span>
        </button>
      </li>`;
    })
    .join('');

  container.innerHTML = header + rows;
}

/** Alimente les listes d'autocomplétion Prénom/Nom à partir des patients du praticien. */
export function populatePatientAutocomplete(patients) {
  const firstNames = document.getElementById('patient-firstnames');
  const lastNames = document.getElementById('patient-lastnames');
  if (!firstNames || !lastNames) return;

  const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

  firstNames.innerHTML = uniqueSorted((patients || []).map((p) => p.first_name))
    .map((name) => `<option value="${escapeHtml(name)}"></option>`)
    .join('');
  lastNames.innerHTML = uniqueSorted((patients || []).map((p) => p.last_name))
    .map((name) => `<option value="${escapeHtml(name)}"></option>`)
    .join('');
}

/** Rendu HTML de l'historique des consultations (formulaires) d'un patient, cliquables. */
export function renderPatientHistory(container, formulaires, formLabels) {
  if (!formulaires || formulaires.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune consultation enregistrée pour ce patient.</p>';
    return;
  }
  container.innerHTML = formulaires
    .map((f) => {
      const label = formLabels?.[f.form_type] || f.form_type;
      const created = new Date(f.created_at);
      const day = created.toLocaleDateString('fr-FR', { day: '2-digit' });
      const monthYear = created.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      const time = created.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      const typeLine = f.practitioner_name ? `Consultation · ${f.practitioner_name}` : 'Consultation';
      return `
      <li>
        <button type="button" class="patient-row history-row is-clickable" data-formulaire-id="${f.id}">
          <span class="history-row__date">
            <span class="history-row__day">${escapeHtml(day)}</span>
            <span class="history-row__month">${escapeHtml(monthYear)}</span>
          </span>
          <span class="history-row__body">
            <span class="patient-name">${escapeHtml(label)}</span>
            <span class="history-row__type">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 11h8M8 15h8M8 19h5"/></svg>
              ${escapeHtml(typeLine)}
            </span>
          </span>
          <span class="history-row__time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            ${escapeHtml(time)}
          </span>
          <span class="patient-col--arrow" aria-hidden="true">›</span>
        </button>
      </li>`;
    })
    .join('');
}

/** Rendu HTML du plan du jour dans le conteneur donné. */
export function renderTodayPlan(container, appointments) {
  if (!appointments || appointments.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucun rendez-vous prévu aujourd’hui.</p>';
    return;
  }
  container.innerHTML = appointments
    .map((a) => {
      const patientName = a.patients ? `${a.patients.first_name} ${a.patients.last_name}` : 'Patient';
      return `
      <li class="appointment-row">
        <span class="appointment-time">${escapeHtml(a.appointment_time?.slice(0, 5) || '')}</span>
        <span class="appointment-patient">${escapeHtml(patientName)}</span>
        <span class="appointment-status status-${escapeHtml(a.status || 'prevu')}">${escapeHtml(a.status || 'prévu')}</span>
      </li>`;
    })
    .join('');
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR');
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
