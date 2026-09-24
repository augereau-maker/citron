// ============================================================================
// fields.js — Source unique de vérité pour le formulaire "Examen Clinique -
// Matrice fonctionnelle" (fiche ZeroBase). Chaque champ précise son type
// (select / text / number / date / textarea) ; app.js s'appuie dessus pour
// générer le formulaire ET la vue de consultation/impression.
// ============================================================================

const RELATION_OPTIONS = [
  'Non évoluée',
  'Classe 1',
  'Classe 2 / 0.5',
  'Classe 2 / 1.0',
  'Classe 2 / 1.5',
  'Classe 3 / 0.5',
  'Classe 3 / 1.0',
  'Classe 3 / 1.5',
];

export const PATIENT_INFO_FIELDS = [
  { key: 'nOrdre', label: "N° d'ordre", type: 'text' },
  { key: 'dateCS', label: 'Date CS', type: 'date' },
  { key: 'dateNaissance', label: 'Date de naissance', type: 'date' },
  { key: 'age', label: 'Âge', type: 'text' },
  { key: 'stature', label: 'Âge estimé', type: 'text' },
  { key: 'correspondant', label: 'Correspondant', type: 'text' },
  { key: 'sexe', label: 'Sexe', type: 'select', options: ['Masculin', 'Féminin'] },
  { key: 'taille', label: 'Taille (cm)', type: 'number' },
  { key: 'poids', label: 'Poids (kg)', type: 'number' },
  { key: 'regles', label: 'Règles', type: 'select', options: ['Non', 'Oui'] },
  { key: 'reglesDate', label: 'Si oui, date', type: 'date' },
  { key: 'accompagnant', label: 'Accompagnant', type: 'text' },
];

export const MOTIVATIONS_ITEMS = [
  { key: 'recouvrement', label: 'Recouvrement' },
  { key: 'beance', label: 'Béance' },
  { key: 'surplomb', label: 'Surplomb' },
  { key: 'encombrement', label: 'Encombrt' },
  { key: 'esthTissusMous', label: 'Esth. T. mous' },
  { key: 'esthDenture', label: 'Esth. denture' },
  { key: 'agenesies', label: 'Agénésies' },
  { key: 'diastemes', label: 'Diastèmes' },
  { key: 'problemesAtm', label: "Pbmes d'ATM" },
  { key: 'artCroiseLat', label: 'Art. croisé Lat' },
  { key: 'artCroiseAnt', label: 'Art. croisé Ant' },
  { key: 'avis', label: 'Avis' },
];

export const MOTIVATIONS_COLUMNS = [
  { key: 'P', label: 'P — Patient' },
  { key: 'R', label: 'R — Parents' },
  { key: 'M', label: 'M — Correspondant' },
];

export const MOTIVATIONS_EXTRA_FIELDS = [
  { key: 'transfert', label: 'Transfert', type: 'text' },
  { key: 'appareil', label: 'Appareil', type: 'text' },
  { key: 'cooperation', label: 'Coopération', type: 'text' },
  { key: 'semainesUtilisees', label: 'Sem. Utilisés', type: 'text' },
  { key: 'autresMotivations', label: 'Autres motivations', type: 'text' },
];

export const SECTIONS = [
  {
    id: 'voiesAeriennes', number: '2.1', title: 'Voies aériennes naso-pharyngées',
    fields: [
      { key: 'amygdales', label: 'Amygdales', type: 'select', options: ['Présentes', 'Retirées', 'Hypertrophiques'] },
      { key: 'vegetations', label: 'Végétations', type: 'select', options: ['Présentes', 'Retirées', 'Hypertrophiques'] },
      { key: 'ronchopathies', label: 'Ronchopathies', type: 'select', options: ['Oui', 'Non'] },
      { key: 'cornets', label: 'Cornets', type: 'select', options: ['Normaux', 'Œdème', 'Saignement'] },
      { key: 'cloisonNasale', label: 'Cloison nasale', type: 'select', options: ['Non déviée', 'A droite', 'A gauche'] },
      { key: 'narines', label: 'Narines (base du nez)', type: 'select', options: ['Etroites', 'Normales'] },
      { key: 'columelle', label: 'Columelle', type: 'select', options: ['Normale', 'Large'] },
      { key: 'allergies', label: 'Allergies', type: 'select', options: ['Oui', 'Non'] },
      { key: 'ventilation', label: 'Ventilation', type: 'select', options: ['Nasale', 'Orale nocturne', 'Orale J&N'] },
      { key: 'evalComplexe', label: 'Éval. plus complexe', type: 'select', options: ['Oui', 'Non'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'musculature', number: '2.2', title: 'Musculature',
    fields: [
      { key: 'periOraleRepos', label: 'Péri-orale au repos', type: 'select', options: ['Hypotonique', 'Normale', 'Hypertonique'] },
      { key: 'periOraleFonction', label: 'Péri-orale en fonction', type: 'select', options: ['Hypotonique', 'Normale', 'Hypertonique'] },
      { key: 'sillonLabioMentonnier', label: 'Sillon labio-mentonnier', type: 'select', options: ['Non', 'Actif haut', 'Actif Pt B', 'Actif bas'] },
      { key: 'influenceBuccinateur', label: 'Influence du buccinateur', type: 'select', options: ['Non', '1', '2', '3'] },
      { key: 'musculatureMasticatrice', label: 'Musculature masticatrice', type: 'select', options: ['Hypotonique', 'Normale', 'Hypertonique'] },
      { key: 'musculatureJugale', label: 'Musculature jugale', type: 'select', options: ['Hypotonique', 'Normale', 'Hypertonique'] },
      { key: 'conditionLinguale', label: 'Condition linguale', type: 'select', options: ['Libre', 'Bridée/frein', 'Bridée/Insertion'] },
      { key: 'evalComplexe', label: 'Éval. plus complexe', type: 'select', options: ['Oui', 'Non'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'habitudes', number: '2.3', title: 'Habitudes',
    fields: [
      { key: 'succionDoigtTetine', label: "Succion d'un doigt / tétine", type: 'select', options: ['Non', 'Oui'] },
      { key: 'succionJusqua', label: "Jusqu'à (âge)", type: 'text' },
      { key: 'postureLinguale', label: 'Posture linguale', type: 'select', options: ['Haute', 'Entre les dents', 'Basse'] },
      { key: 'interpositionLinguale', label: 'Interposition linguale', type: 'select', options: ['Non', 'Antérieure', 'Postérieure'] },
      { key: 'empreintesLangue', label: 'Empreintes dents sur la langue', type: 'select', options: ['Non', 'Oui'] },
      { key: 'succionLabiale', label: 'Succion labiale', type: 'select', options: ['Non', 'Oui'] },
      { key: 'onychophagie', label: 'Onychophagie', type: 'select', options: ['Non', 'Oui'] },
      { key: 'bruxisme', label: 'Bruxisme', type: 'select', options: ['Non', 'Oui'] },
      { key: 'contractureMentonniere', label: 'Contracture mentonnière', type: 'select', options: ['Non', 'Oui'] },
      { key: 'evalComplexe', label: 'Éval. plus complexe', type: 'select', options: ['Non', 'Oui'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'posture', number: '2.4', title: 'Posture',
    fields: [
      { key: 'teteCou', label: 'Tête / Cou', type: 'select', options: ['RAS', 'Inclinée'] },
      { key: 'teteCouDetail', label: 'Précision (si inclinée)', type: 'text' },
      { key: 'colonneVertebrale', label: 'Colonne vertébrale', type: 'select', options: ['RAS', 'Voûtée'] },
      { key: 'colonneVertebraleDetail', label: 'Précision (si voûtée)', type: 'text' },
      { key: 'douleurs', label: 'Douleurs', type: 'select', options: ['Non', 'Localisation'] },
      { key: 'douleursDetail', label: 'Localisation des douleurs', type: 'text' },
      { key: 'corset', label: 'Corset', type: 'select', options: ['Non', 'Oui'] },
      { key: 'semelles', label: 'Semelles', type: 'select', options: ['Non', 'Oui'] },
      { key: 'suiviOsteopathique', label: 'Suivi ostéopathique', type: 'select', options: ['Non', 'Oui'] },
      { key: 'evalComplexe', label: 'Éval. plus complexe', type: 'select', options: ['Non', 'Oui'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'mastication', number: '2.5', title: 'Évaluation de la mastication',
    fields: [
      { key: 'evalNutrition', label: 'Év. de la nutrition', type: 'select', options: ['Non', 'Oui'] },
      { key: 'evalMastication', label: 'Év. de la mastication', type: 'select', options: ['Non', 'Oui'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'occlusale', number: '3.1', title: 'Évaluation occlusale',
    fields: [
      { key: 'surplomb', label: 'Surplomb (mm)', type: 'number' },
      { key: 'recouvrement', label: 'Recouvrement (%)', type: 'number' },
      { key: 'beance', label: 'Béance (mm)', type: 'number' },
      { key: 'relationMolaireDroite', label: 'Relation molaire droite', type: 'select', options: RELATION_OPTIONS },
      { key: 'relationCanineDroite', label: 'Relation canine droite', type: 'select', options: RELATION_OPTIONS },
      { key: 'relationCanineGauche', label: 'Relation canine gauche', type: 'select', options: RELATION_OPTIONS },
      { key: 'relationMolaireGauche', label: 'Relation molaire gauche', type: 'select', options: RELATION_OPTIONS },
    ],
  },
  {
    id: 'fonctionnelle', number: '3.2', title: 'Évaluation fonctionnelle',
    fields: [
      { key: 'maxillaireEnV', label: 'Maxillaire en V', type: 'select', options: ['Non', 'Oui'] },
      { key: 'versionIncisive', label: 'Version incisive', type: 'select', options: ['Non', 'Palatine', 'Vestibulaire'] },
      { key: 'inverseArticule', label: "Inversé d'articulé", type: 'select', options: ['Non', 'Droite', 'Antérieure', 'Gauche'] },
      { key: 'deviationFonctionnelleMand', label: 'Déviation fonctionnelle de la mandibule', type: 'select', options: ['Non', 'Droite', 'Antérieure', 'Gauche'] },
      { key: 'verrouillageMandibulaire', label: 'Verrouillage mandibulaire', type: 'select', options: ['Non', 'Sagittale', 'Transversale', 'Les 2'] },
      { key: 'planOcclBipupillaire', label: 'Plan occl. / Plan bipupillaire', type: 'select', options: ['Non', 'Convergents : droite', 'Convergents : gauche'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'esthetique', number: '3.3', title: 'Évaluation esthétique',
    fields: [
      { key: 'ligneMedianeMaxFace', label: 'Ligne médiane maxillaire / Face', type: 'select', options: ['Déviée à droite', 'Centrée', 'Déviée à gauche'] },
      { key: 'ligneMedianeMandFace', label: 'Ligne médiane mandibulaire / Face', type: 'select', options: ['Déviée à droite', 'Centrée', 'Déviée à gauche'] },
      { key: 'ligneMedianeMandMax', label: 'Ligne médiane Mandibule / Maxillaire', type: 'select', options: ['Centrée', 'Non centrée'] },
      { key: 'ligneMedianeMandMaxMm', label: 'Si non centrée : mm à droite / à gauche', type: 'text' },
      { key: 'longueurLevreSupRepos', label: 'Longueur lèvre sup. au repos (mm)', type: 'number' },
      { key: 'ligneLevreSupRepos', label: 'Ligne lèvre sup. au repos (mm)', type: 'number' },
      { key: 'genciveExposeeSourire', label: 'Gencive exposée au sourire large (D/devant/G, mm)', type: 'text' },
      { key: 'occlusionLabialeRepos', label: 'Occlusion labiale au repos', type: 'select', options: ['Neutre', 'Serrée'] },
      { key: 'espaceInterLabialeRepos', label: 'Espace inter-labial au repos (mm)', type: 'number' },
      { key: 'contourLevreInferieure', label: 'Contour lèvre inférieure (repos / sourire, mm)', type: 'text' },
    ],
  },
  {
    id: 'clinique', number: '3.4', title: 'Évaluation clinique',
    fields: [
      { key: 'caries', label: 'Caries', type: 'text' },
      { key: 'fractures', label: 'Fractures', type: 'text' },
      { key: 'taches', label: 'Taches', type: 'text' },
      { key: 'tartre', label: 'Tartre', type: 'text' },
      { key: 'etatParodontal', label: 'État parodontal', type: 'select', options: ['Bon', 'Moyen', 'A contrôler'] },
      { key: 'hygieneDentaire', label: 'Hygiène dentaire', type: 'select', options: ['Excellente', 'Bonne', 'Moyenne', 'Faible', 'Incompatible'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'faciale', number: '4', title: 'Évaluation faciale',
    fields: [
      { key: 'asymetriesFaciales', label: 'Asymétries faciales', type: 'select', options: ['Non', 'Oui'] },
      { key: 'evalProfil', label: 'Évaluation du profil', type: 'textarea' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'atm', number: '5', title: "Évaluation de l'ATM",
    fields: [
      { key: 'deviationMandOuverture', label: "Déviation mandibulaire à l'ouverture", type: 'select', options: ['Non', 'Droite', 'Gauche'] },
      { key: 'disparitionClaquementPropulsion', label: 'Disparition du claquement en propulsion', type: 'select', options: ['Non', 'Oui'] },
      { key: 'evalComplexe', label: 'Éval. plus complexe', type: 'select', options: ['Non', 'Oui'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'personnalite', number: '6', title: 'Évaluation de la personnalité',
    fields: [
      { key: 'fratrieFreres', label: 'Fratrie — nb frères', type: 'number' },
      { key: 'fratrieSoeurs', label: 'Fratrie — nb sœurs', type: 'number' },
      { key: 'fratrieRang', label: 'Rang', type: 'text' },
      { key: 'cooperationPatient', label: 'Coopération apparente (patient)', type: 'select', options: ['Basse', 'Moyenne', 'Elevée'] },
      { key: 'stressPatient', label: 'Stress (patient)', type: 'select', options: ['Bas', 'Moyen', 'Elevé'] },
      { key: 'travailScolaire', label: 'Travail scolaire', type: 'select', options: ['Seul', 'Aidé', 'Difficile'] },
      { key: 'activitesExtraScolaires', label: 'Activités extra-scolaires', type: 'text' },
      { key: 'cooperationAccompagnant', label: 'Coopération apparente (accompagnant)', type: 'select', options: ['Basse', 'Moyenne', 'Elevée'] },
      { key: 'stressAccompagnant', label: 'Stress (accompagnant)', type: 'select', options: ['Bas', 'Moyen', 'Elevé'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
];

export const ATM_MOVEMENTS = [
  { key: 'ouverture', label: 'Ouverture' },
  { key: 'protrusion', label: 'Protrusion' },
  { key: 'latDroite', label: 'Lat. droite' },
  { key: 'latGauche', label: 'Lat. Gauche' },
];

export const ATM_COLUMNS = [
  { key: 'claquementsD', label: 'Claquements D' },
  { key: 'claquementsG', label: 'Claquements G' },
  { key: 'douleursD', label: 'Douleurs D' },
  { key: 'douleursG', label: 'Douleurs G' },
];

export const PROBLEMES_FIELDS = [
  { key: 'problemesParticuliers', label: '7 — Problèmes particuliers' },
  { key: 'problemesMedicaux', label: '8 — Problèmes médicaux' },
];

export const MANAGEMENT = {
  traitementOptions: [
    { value: 'non_necessaire', label: 'Traitement non nécessaire' },
    { value: 'trop_tot', label: 'Traitement trop tôt' },
  ],
  raisonsTropTot: [
    { value: 'revoir_en', label: 'Revoir en' },
    { value: 'arret_pouce', label: 'Quand arrêt du pouce' },
    { value: 'reeducation_automatisee', label: 'Quand rééducation automatisée' },
    { value: 'motivation_plus_importante', label: 'Quand motivation plus importante' },
    { value: 'denture_definitive', label: 'En denture définitive' },
  ],
  rdvSuivants: [
    { key: 'examens', label: 'Examens' },
    { key: 'bilan', label: 'Bilan' },
    { key: 'controleHygiene', label: 'Contrôle hygiène' },
  ],
  examensNecessaires: [
    { key: 'deBase', label: 'De base' },
    { key: 'autres', label: 'Autres' },
  ],
  courrierPour: [
    { key: 'soins', label: 'Soins' },
    { key: 'reeducation', label: 'Rééducation' },
    { key: 'autres', label: 'Autres' },
  ],
  explicationsDonnees: [
    { key: 'consentementEclaire', label: 'Consentement éclairé remis' },
    { key: 'devisBilan', label: 'Devis pour bilan remis' },
    { key: 'rdvHeuresScolaires', label: 'RDV pendant les heures scolaires' },
    { key: 'enfantPrisSeul', label: 'Enfant pris seul' },
  ],
};
