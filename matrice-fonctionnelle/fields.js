// ============================================================================
// fields.js — Source unique de vérité pour le formulaire "Évaluation Matrice
// Fonctionnelle". Chaque champ = un menu déroulant (select).
// Ajouter un champ = ajouter une ligne ici, le formulaire et la vue détail
// se mettent à jour automatiquement.
// ============================================================================

export const FIELD_GROUPS = [
  {
    id: 'general',
    title: 'Informations générales',
    fields: [
      { key: 'autresMotivations', label: 'Autres motivations', options: ['/', 'Esthétique', 'Fonctionnelle', 'Respiratoire', 'Douleur', 'Autre'] },
      { key: 'transfert', label: 'Transfert', options: ['/', 'Oui', 'Non'] },
      { key: 'appareil', label: 'Appareil', options: ['/', 'Aucun', 'Amovible', 'Fixe multi-attaches', 'Aligneurs', 'Autre'] },
      { key: 'cooperation', label: 'Coopération', options: ['/', 'Bonne', 'Moyenne', 'Faible'] },
      { key: 'semainesUtilisees', label: 'Sem. utilisés', options: ['/', '0', '1-4', '5-8', '9-12', '>12'] },
    ],
  },
  {
    id: 'voiesAeriennes',
    title: 'Voies aériennes sup.',
    fields: [
      { key: 'amygdales', label: 'Amygdales', options: ['Absentes', 'Présentes', 'Hypertrophiées', 'Opérées'] },
      { key: 'vegetations', label: 'Végétations', options: ['Absentes', 'Présentes', 'Hypertrophiées', 'Opérées'] },
      { key: 'ronchopathies', label: 'Ronchopathies', options: ['Non', 'Oui'] },
      { key: 'cornets', label: 'Cornets', options: ['Normaux', 'Hypertrophiés'] },
      { key: 'cloisonNasale', label: 'Cloison nasale', options: ['Non déviée', 'Déviée'] },
      { key: 'narines', label: 'Narines', options: ['RAS', 'Pincées', 'Asymétriques'] },
      { key: 'columelle', label: 'Columelle', options: ['RAS', 'Déviée'] },
      { key: 'allergies', label: 'Allergies', options: ['Non', 'Oui'] },
      { key: 'ventilation', label: 'Ventilation', options: ['Nasale', 'Orale', 'Mixte', 'Orale nocturne'] },
      { key: 'voiesEvalComplexe', label: 'Éval. + complexe', options: ['Non', 'Oui'] },
    ],
  },
  {
    id: 'musculature',
    title: 'Musculature',
    fields: [
      { key: 'levreRepos', label: 'Lèvre au repos', options: ['Normale', 'Hypotonique', 'Hypertonique', 'Éversée'] },
      { key: 'levreFonction', label: 'Lèvre en fonction', options: ['Normale', 'Hypotonique', 'Hypertonique'] },
      { key: 'contrPeriorale', label: 'Contr. périorale', options: ['Non', 'Oui'] },
      { key: 'contrMenton', label: 'Contr. menton', options: ['Non', 'Oui'] },
      { key: 'slm', label: 'SLM', options: ['Non', 'Oui'] },
      { key: 'buccinateur', label: 'Buccinateur', options: ['Non influent', 'Influent 1', 'Influent 2', 'Influent 3'] },
      { key: 'mMasticatrice', label: 'M. masticatrice', options: ['Normale', 'Hypertonique', 'Hypotonique'] },
      { key: 'mJugale', label: 'M. jugale', options: ['Normale', 'Hypertonique', 'Hypotonique'] },
      { key: 'langue', label: 'Langue', options: ['Libre', 'Freinée', 'Ankyloglossie'] },
      { key: 'musculatureEvalComplexe', label: 'Éval. + complexe', options: ['Non', 'Oui'] },
    ],
  },
  {
    id: 'habitudes',
    title: 'Habitudes',
    fields: [
      { key: 'succionDigitale', label: 'Succion digitale', options: ['Non', 'Pouce', 'Doigt', 'Tétine', 'Sevrée'] },
      { key: 'interpLangue', label: 'Interp. langue', options: ['Non', 'Antérieure', 'Latérale', 'Bilatérale'] },
      { key: 'postureLinguale', label: 'Posture linguale', options: ['Haute', 'Moyenne', 'Basse'] },
      { key: 'empreintesLangue', label: 'Empreintes sur la langue', options: ['Non', 'Oui'] },
      { key: 'succionLabiale', label: 'Succion labiale', options: ['Non', 'Oui'] },
      { key: 'onychophagie', label: 'Onychophagie', options: ['Non', 'Oui'] },
      { key: 'bruxisme', label: 'Bruxisme', options: ['Non', 'Diurne', 'Nocturne'] },
      { key: 'habitudesEvalComplexe', label: 'Éval. plus complexe', options: ['Non', 'Oui'] },
    ],
  },
  {
    id: 'posture',
    title: 'Posture',
    fields: [
      { key: 'teteCou', label: 'Tête / Cou', options: ['RAS', 'Anteposition', 'Rétroposition'] },
      { key: 'colonneVertebrale', label: 'C. vertébrale', options: ['RAS', 'Scoliose', 'Hyperlordose', 'Hypercyphose'] },
      { key: 'douleurs', label: 'Douleurs', options: ['Non', 'Oui'] },
      { key: 'corset', label: 'Corset', options: ['Non', 'Oui'] },
      { key: 'semelles', label: 'Semelles', options: ['Non', 'Oui'] },
      { key: 'suiviOsteopathique', label: 'Suivi ostéopathique', options: ['Non', 'Oui'] },
      { key: 'postureEvalComplexe', label: 'Éval. plus complexe', options: ['Non', 'Oui'] },
      { key: 'evalNutrition', label: 'Éval. de la nutrition', options: ['Non', 'Oui', 'À prévoir'] },
      { key: 'evalMastication', label: 'Éval. de la mastication', options: ['Non', 'Oui', 'À prévoir'] },
    ],
  },
];
