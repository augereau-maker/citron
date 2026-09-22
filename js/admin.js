// ============================================================================
// admin.js
// Espace Administrateur : identifiant/mot de passe en dur (admin / CitroN),
// liste de tous les patients avec suppression, et création de comptes
// praticien (identifiant + mot de passe généré). Session admin conservée en
// sessionStorage (pas un compte Supabase Auth).
// ============================================================================

import { supabase } from './supabase-client.js';
import { showScreen } from './navigation.js';
import { formLabels } from './validation.js';

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'CitroN';
const SESSION_KEY = 'citron_admin_session';

/** Vérifie les identifiants admin (comparaison locale, en miroir du contrôle RPC côté serveur). */
export function isAdminCredentials(login, password) {
  return login === ADMIN_LOGIN && password === ADMIN_PASSWORD;
}

/** Ouvre une session admin. */
export function adminSignIn() {
  sessionStorage.setItem(SESSION_KEY, '1');
}

/** Restaure une session admin déjà active (ex. rechargement de page). */
export function restoreAdminSession() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

/** Déconnecte l'administrateur. */
export function adminSignOut() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Affiche l'Espace Administrateur et charge la liste des patients et des praticiens. */
export async function enterAdminPanel() {
  showScreen('admin');
  await Promise.all([refreshAdminPatientList(), refreshAdminFormulaireList(), refreshAdminPractitionerList()]);
}

async function refreshAdminPatientList() {
  const { data, error } = await supabase.rpc('admin_list_patients', { p_admin_password: ADMIN_PASSWORD });
  const container = document.getElementById('admin-patient-list');

  if (error || !data || data.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucun patient enregistré.</p>';
    return;
  }

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—');
  const formatDateTime = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';

  const header = `
    <li class="patient-row patient-row--header" aria-hidden="true">
      <span class="patient-col patient-col--name">Nom patient</span>
      <span class="patient-col patient-col--login">Codes</span>
      <span class="patient-col patient-col--password">Mot de passe</span>
      <span class="patient-col patient-col--created">Date de création</span>
      <span class="patient-col patient-col--consult">Dernière consultation</span>
      <span class="patient-col patient-col--practitioner">Prescripteur</span>
      <span class="patient-col patient-col--arrow"></span>
    </li>`;

  const rows = data
    .map((p) => {
      const fullName = `${escapeHtml(p.last_name)} ${escapeHtml(p.first_name)}`;
      return `
      <li class="patient-row admin-patient-row">
        <span class="patient-col patient-col--name patient-name">${fullName}</span>
        <span class="patient-col patient-col--login">${escapeHtml(p.login || '—')}</span>
        <span class="patient-col patient-col--password">${escapeHtml(p.password || '—')}</span>
        <span class="patient-col patient-col--created">${formatDate(p.created_at)}</span>
        <span class="patient-col patient-col--consult">${formatDateTime(p.last_consultation_at)}</span>
        <span class="patient-col patient-col--practitioner">${escapeHtml(p.last_consultation_practitioner || '—')}</span>
        <button type="button" class="admin-delete-btn" data-patient-id="${p.id}" aria-label="Supprimer ${fullName}">×</button>
      </li>`;
    })
    .join('');

  container.innerHTML = header + rows;
}

async function refreshAdminFormulaireList() {
  const { data, error } = await supabase.rpc('admin_list_formulaires', { p_admin_password: ADMIN_PASSWORD });
  const container = document.getElementById('admin-formulaire-list');

  if (error || !data || data.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune consultation enregistrée.</p>';
    return;
  }

  container.innerHTML = data
    .map((f) => {
      const label = formLabels[f.form_type] || f.form_type;
      const patientName = f.patient_first_name || f.patient_last_name
        ? `${escapeHtml(f.patient_last_name || '')} ${escapeHtml(f.patient_first_name || '')}`.trim()
        : 'Patient supprimé';
      const date = new Date(f.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      const meta = f.practitioner_name ? `${patientName} · ${date} · ${f.practitioner_name}` : `${patientName} · ${date}`;
      return `
      <li class="patient-row admin-patient-row">
        <span class="patient-name">${escapeHtml(label)}</span>
        <span class="admin-patient-row__right">
          <span class="patient-meta">${escapeHtml(meta)}</span>
          <button type="button" class="admin-delete-btn" data-formulaire-id="${f.id}" aria-label="Supprimer cette consultation">×</button>
        </span>
      </li>`;
    })
    .join('');
}

async function refreshAdminPractitionerList() {
  const { data, error } = await supabase.rpc('admin_list_practitioners', { p_admin_password: ADMIN_PASSWORD });
  const container = document.getElementById('admin-practitioner-list');

  if (error || !data || data.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucun compte praticien créé.</p>';
    return;
  }

  container.innerHTML = data
    .map(
      (pr) => `
      <li class="patient-row admin-patient-row">
        <span class="patient-name">${escapeHtml(pr.login)}</span>
        <span class="admin-patient-row__right">
          <span class="patient-credentials__value">${escapeHtml(pr.password)}</span>
          <button type="button" class="admin-delete-btn" data-practitioner-id="${pr.id}" aria-label="Supprimer le compte ${escapeHtml(pr.login)}">×</button>
        </span>
      </li>`
    )
    .join('');
}

document.getElementById('admin-patient-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-patient-id]');
  if (!btn) return;
  if (!window.confirm('Supprimer définitivement ce patient et son historique ?')) return;

  await supabase.rpc('admin_delete_patient', {
    p_admin_password: ADMIN_PASSWORD,
    p_patient_id: btn.dataset.patientId,
  });
  await refreshAdminPatientList();
});

document.getElementById('admin-formulaire-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-formulaire-id]');
  if (!btn) return;
  if (!window.confirm('Supprimer définitivement cette consultation ?')) return;

  const { error } = await supabase.rpc('admin_delete_formulaire', {
    p_admin_password: ADMIN_PASSWORD,
    p_formulaire_id: btn.dataset.formulaireId,
  });
  if (error) {
    window.alert(`Suppression impossible : ${error.message}`);
    return;
  }
  await refreshAdminFormulaireList();
});

document.getElementById('admin-practitioner-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-practitioner-id]');
  if (!btn) return;
  if (!window.confirm('Supprimer définitivement ce compte praticien ?')) return;

  const { error } = await supabase.rpc('admin_delete_practitioner', {
    p_admin_password: ADMIN_PASSWORD,
    p_practitioner_id: btn.dataset.practitionerId,
  });
  if (error) {
    window.alert(`Suppression impossible : ${error.message}`);
    return;
  }
  await refreshAdminPractitionerList();
});

document.getElementById('btn-generate-practitioner-password').addEventListener('click', () => {
  document.getElementById('admin-generated-password').value = generatePractitionerPassword();
});

document.getElementById('form-admin-create-practitioner').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const feedback = document.getElementById('admin-create-practitioner-feedback');
  feedback.textContent = '';

  const login = form.login.value.trim();
  const password = form.password.value;

  if (!login) {
    feedback.textContent = 'Merci de renseigner un identifiant.';
    feedback.className = 'form-feedback is-error';
    return;
  }
  if (!password) {
    feedback.textContent = 'Merci de générer un mot de passe.';
    feedback.className = 'form-feedback is-error';
    return;
  }

  const { error } = await supabase.rpc('admin_create_practitioner', {
    p_admin_password: ADMIN_PASSWORD,
    p_login: login,
    p_password: password,
  });

  if (error) {
    feedback.textContent = error.code === '23505' ? 'Cet identifiant est déjà utilisé.' : error.message;
    feedback.className = 'form-feedback is-error';
    return;
  }

  feedback.textContent = `Compte praticien "${login}" créé avec succès.`;
  feedback.className = 'form-feedback is-success';
  form.reset();
  await refreshAdminPractitionerList();
});

function generatePractitionerPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let password = '';
  for (let i = 0; i < 6; i++) password += chars[Math.floor(Math.random() * chars.length)];
  return password;
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
