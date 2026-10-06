// ============================================================================
// orthophonie-fields.js
// Définition du formulaire "Bilan orthophonique" (transcrit de la fiche
// papier). La date du bilan est celle de la consultation (horodatage).
// Tous les champs sont facultatifs. Format : voir form-def-utils.js.
// ============================================================================

const EFFICIENCE = [
  ['efficiente', 'Efficiente'],
  ['nonEfficiente', 'Non efficiente'],
];

export const orthophonieForm = {
  formType: 'orthophonie',
  title: 'Bilan orthophonique',
  groups: [
    {
      id: 'fonctions',
      title: '1. Fonctions',
      matrix: {
        columns: EFFICIENCE,
        rows: [
          ['respiration', 'Respiration'],
          ['mouchage', 'Mouchage'],
          ['mastication', 'Mastication'],
          ['deglutition', 'Déglutition'],
        ],
      },
    },
    {
      id: 'positions',
      title: '2. Positions linguales',
      matrix: {
        columns: EFFICIENCE,
        rows: [
          ['repos', 'Repos'],
          ['articulation', 'Articulation'],
        ],
      },
    },
    {
      id: 'quotidien',
      title: '3. À travailler au quotidien',
      items: [
        ['mouchage', 'Mouchage'],
        [
          'masticationBilaterale',
          'Mastication bilatérale alternée et bouche fermée (privilégier les aliments solides, croustillants, croquants)',
        ],
        [
          'respirationNasale',
          "Respiration nasale si non-obstruction (pendant qu'il regarde un livre, un dessin animé ou qu'il dessine, veiller à ce qu'il ait la bouche fermée)",
        ],
        ['boirePaille', 'Boire à la paille'],
      ],
    },
    {
      id: 'succion',
      title: '4. Habitude de succion',
      fields: [
        { key: 'habitude', label: 'Habitude de succion', type: 'radio', options: [['oui', 'Oui'], ['non', 'Non']] },
        { key: 'objectif', label: 'Si oui, objectif', type: 'text', defaultValue: 'ARRÊT' },
      ],
    },
    {
      id: 'observations',
      title: 'Observations',
      fields: [{ key: 'texte', label: 'Observations', type: 'textarea' }],
    },
  ],
};
