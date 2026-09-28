// ============================================================================
// kine-fields.js
// Définition du formulaire "Fiche d'examen kinésithérapique" (transcrit de la
// fiche papier). L'identité du patient et la date ne sont pas saisies : elles
// viennent de la fiche patient. Tous les champs sont facultatifs.
// Format : voir form-def-utils.js (items, matrix, fields).
// ============================================================================

const OUI_NON = [
  ['oui', 'Oui'],
  ['non', 'Non'],
];

const MOUVEMENTS = [
  ['ouverture', 'a - Ouverture incisive maximale'],
  ['protrusion', 'b - Protrusion maximale'],
  ['lateraliteGauche', 'c - Latéralité gauche maxi'],
  ['lateraliteDroite', 'd - Latéralité droite maxi'],
];

export const kineForm = {
  formType: 'kinesitherapie',
  title: "Fiche d'examen kinésithérapique",
  groups: [
    {
      id: 'contexte',
      title: 'Contexte',
      fields: [
        { key: 'fratrie', label: 'Fratrie', type: 'text' },
        { key: 'rang', label: 'Rang', type: 'text' },
        { key: 'classe', label: 'Classe', type: 'text' },
        { key: 'sport', label: 'Sport pratiqué', type: 'text' },
      ],
    },
    {
      id: 'examen',
      title: 'Examen',
      fields: [
        { key: 'appareil', label: 'Appareil', type: 'radio', options: OUI_NON },
        { key: 'appareilType', label: 'Type', type: 'text' },
      ],
    },
    {
      id: 'langue',
      title: 'La langue',
      fields: [
        {
          key: 'positionRepos',
          label: 'Position de repos',
          type: 'radio',
          options: [
            ['entreLesDents', 'Entre les dents'],
            ['entreLesLevres', 'Entre les lèvres'],
            ['invisible', 'Invisible'],
          ],
        },
        { key: 'volume', label: 'Volume', type: 'text' },
        { key: 'frein', label: 'Frein', type: 'text' },
        {
          key: 'deglutition',
          label: 'Déglutition',
          type: 'radio',
          options: [
            ['atypique', 'Atypique'],
            ['normale', 'Normale'],
          ],
        },
      ],
      items: [
        ['contractionLabiale', 'Contraction labiale'],
        ['contractionJugale', 'Contraction jugale'],
      ],
    },
    {
      id: 'phonation',
      title: 'Phonation',
      matrix: {
        columns: [
          ['bonne', 'Bonne'],
          ['mauvaise', 'Mauvaise'],
        ],
        rows: [
          ['L', 'L'],
          ['DNT', 'D N T'],
          ['SZ', 'S Z'],
          ['CHJ', 'CH J'],
          ['VF', 'V F'],
          ['labiales', 'Labiales'],
        ],
      },
    },
    {
      id: 'levres',
      title: 'Les lèvres — tonicité',
      matrix: {
        columns: [
          ['sup', 'Sup.'],
          ['inf', 'Inf.'],
        ],
        rows: [
          ['atone', 'Atone'],
          ['tonique', 'Tonique'],
          ['contractee', 'Contractée en sangle'],
          ['buccinateurEfficace', 'Buccinateur : efficace'],
          ['buccinateurFatigable', 'Buccinateur : fatigable'],
        ],
      },
    },
    {
      id: 'sillon',
      title: 'Sillon labio-mentonnier',
      fields: [
        {
          key: 'aspect',
          label: 'Sillon',
          type: 'radio',
          options: [
            ['marque', 'Marqué'],
            ['efface', 'Effacé'],
            ['tendu', 'Tendu'],
          ],
        },
      ],
    },
    {
      id: 'atm',
      title: 'A.T.M. — Articulations temporo-mandibulaires',
      fields: [
        {
          key: 'propulsion',
          label: 'Propulsion',
          type: 'radio',
          options: [
            ['souple', 'Souple'],
            ['raide', 'Raide'],
            ['asymetrique', 'Asymétrique'],
            ['nonComprise', 'Non comprise'],
          ],
        },
        {
          key: 'propulsionCote',
          label: 'Si asymétrique : côté',
          type: 'radio',
          options: [
            ['droite', 'Droite'],
            ['gauche', 'Gauche'],
          ],
        },
      ],
      matrix: {
        columns: [
          ['droite', 'Droite'],
          ['gauche', 'Gauche'],
        ],
        rows: [
          ['souple', 'Latéralité souple'],
          ['raide', 'Latéralité raide'],
          ['nonComprise', 'Latéralité non comprise'],
        ],
      },
    },
    {
      id: 'mouvements',
      title: '1 - Mouvements mandibulaires',
      fields: MOUVEMENTS.flatMap(([key, label]) => [
        { key: `${key}Mesure`, label: `${label} (m/m)`, type: 'text' },
        { key: `${key}Claquement`, label: `${label} — claquement`, type: 'radio', options: OUI_NON },
        { key: `${key}Douleur`, label: `${label} — douleur`, type: 'radio', options: OUI_NON },
      ]),
    },
    {
      id: 'respiration',
      title: 'Respiration',
      fields: [
        {
          key: 'type',
          label: 'Respiration',
          type: 'radio',
          options: [
            ['buccale', 'Buccale'],
            ['nasale', 'Nasale'],
            ['mixte', 'Mixte'],
          ],
        },
        { key: 'passeORL', label: 'Passé ORL', type: 'radio', options: OUI_NON },
        {
          key: 'rosenthal',
          label: 'Test de Rosenthal',
          type: 'radio',
          options: [
            ['negatif', 'Négatif'],
            ['positif', 'Positif'],
          ],
        },
        { key: 'nombreRespirations', label: 'Nombre de respirations', type: 'text' },
        { key: 'etatNez', label: 'État du nez (propre, sale, obstrué, déformé…)', type: 'text' },
        { key: 'testNarinaire', label: 'Test narinaire', type: 'text' },
      ],
    },
    {
      id: 'habitudes',
      title: 'Habitudes nocives',
      fields: [
        { key: 'langue', label: 'Langue', type: 'text' },
        { key: 'levres', label: 'Lèvres', type: 'text' },
      ],
    },
    {
      id: 'commentaires',
      title: 'Commentaires',
      fields: [{ key: 'texte', label: 'Commentaires', type: 'textarea' }],
    },
  ],
};
