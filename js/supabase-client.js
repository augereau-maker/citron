// ============================================================================
// supabase-client.js
// Seul fichier responsable de la connexion à Supabase.
// Aucune logique métier ici : uniquement l'initialisation du client.
// Tous les autres modules importent `supabase` depuis ce fichier.
// ============================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://rciwwiudmditynioixxn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i3u8IpivypkXQz5U6lBxPQ_ksIyjeKm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
