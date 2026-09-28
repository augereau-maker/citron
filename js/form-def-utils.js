// ============================================================================
// form-def-utils.js
// Helpers partagés (rendu, validation, résumé) pour les définitions de
// formulaires : cases à cocher (`items`), tableaux de cases (`matrix`) et
// champs radio / texte / zone de texte (`fields`) déclarés par groupe.
// ============================================================================

/** Cases à cocher d'un groupe : `items` + cases générées par le tableau `matrix` (ligne × colonne). */
export function groupItems(group) {
  const items = [...(group.items || [])];
  if (group.matrix) {
    for (const [rowKey, rowLabel] of group.matrix.rows) {
      for (const [colKey, colLabel] of group.matrix.columns) {
        items.push([`${rowKey}_${colKey}`, `${rowLabel} — ${colLabel}`]);
      }
    }
  }
  return items;
}

/** Nom HTML d'un champ déclaré dans un groupe (préfixé par le groupe, comme les cases). */
export function groupFieldName(group, field) {
  return `${group.id}_${field.key}`;
}

/** Tous les champs (radio/texte) d'une définition : ceux du formulaire et ceux des groupes, avec leur nom HTML. */
export function formFieldEntries(formDef) {
  const entries = (formDef.fields || []).map((field) => ({ name: field.key, field }));
  for (const group of formDef.groups) {
    for (const field of group.fields || []) {
      entries.push({ name: groupFieldName(group, field), field });
    }
  }
  return entries;
}
