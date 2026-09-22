// ============================================================================
// orthodontie-fields.js
// Source unique de vérité pour le formulaire "Bilan orthodontique initial".
// Chaque item = une case à cocher. Les clés sont préfixées par groupe pour
// garantir leur unicité (ex: "motif_deglutitionAtypique" vs
// "fonctions_deglutitionAtypique", qui désignent le même terme dans deux
// contextes cliniques différents).
//
// Ce même fichier sert à :
//  1. Générer dynamiquement le HTML du formulaire (orthodontie-form.js)
//  2. Générer dynamiquement le schéma de validation Zod (validation.js)
// Ajouter un item = ajouter une ligne ici, rien d'autre à toucher.
// ============================================================================

export const orthodontieForm = {
  formType: 'orthodontie',
  title: 'Bilan orthodontique initial',
  fields: [
    {
      key: 'traitementDebute',
      label: 'Un traitement a-t-il débuté ?',
      type: 'radio',
      required: true,
      options: [
        ['oui', 'Oui'],
        ['non', 'Non'],
      ],
    },
    {
      key: 'traitementType',
      label: 'Quel type de traitement ?',
      type: 'text',
      required: true,
    },
  ],
  groups: [
    {
      id: 'motif',
      title: '1. Motif et anamnèse',
      items: [
        ['demandeEsthetique', 'Demande esthétique'],
        ['demandeFonctionnelle', 'Demande fonctionnelle'],
        ['douleurGeneArticulaire', 'Douleur ou gêne articulaire'],
        ['antecedentTraumatismeDentaire', 'Antécédent de traumatisme dentaire'],
        ['antecedentOrthodontique', 'Antécédent orthodontique'],
        ['antecedentsMedicauxChirurgicaux', 'Antécédents médicaux ou chirurgicaux pertinents'],
        ['antecedentsFamiliauxDysmorphose', 'Antécédents familiaux de dysmorphose'],
        ['troublesVentilationNasale', 'Troubles de la ventilation nasale'],
        ['ronflementNocturne', 'Ronflement nocturne'],
        ['succionDigitaleTetineProlongee', 'Succion digitale ou tétine prolongée'],
        ['deglutitionAtypique', 'Déglutition atypique'],
        ['troublesPhonation', 'Troubles de la phonation'],
        ['bruxismeParafonctions', 'Bruxisme ou parafonctions'],
        ['motivationCooperationEvaluees', 'Motivation et coopération évaluées'],
      ],
    },
    {
      id: 'exoFace',
      title: '2. Examen exobuccal — Face',
      items: [
        ['symetrieFacialeRespectee', 'Symétrie faciale respectée'],
        ['asymetrieFaciale', 'Asymétrie faciale'],
        ['etageInferieurNormal', 'Étage inférieur normal'],
        ['excesVertical', 'Excès vertical'],
        ['insuffisanceVerticale', 'Insuffisance verticale'],
        ['deviationMenton', 'Déviation du menton'],
        ['sourireHarmonieux', 'Sourire harmonieux'],
        ['expositionGingivaleExcessive', 'Exposition gingivale excessive'],
        ['inocclusionLabialeRepos', 'Inocclusion labiale au repos'],
      ],
    },
    {
      id: 'exoProfil',
      title: '2. Examen exobuccal — Profil',
      items: [
        ['profilEquilibre', 'Profil équilibré'],
        ['profilConvexe', 'Profil convexe'],
        ['profilConcave', 'Profil concave'],
        ['retrognathieMandibulaire', 'Rétrognathie mandibulaire'],
        ['prognathieMandibulaire', 'Prognathie mandibulaire'],
        ['hypoplasieMaxillaire', 'Hypoplasie maxillaire'],
        ['protrusionIncisiveLabiale', 'Protrusion incisive/labiale'],
        ['angleNasoLabialModifie', 'Angle naso-labial modifié'],
        ['competenceLabialeInsuffisante', 'Compétence labiale insuffisante'],
      ],
    },
    {
      id: 'fonctions',
      title: '3. Fonctions oro-faciales',
      items: [
        ['ventilationNasale', 'Ventilation nasale'],
        ['ventilationBuccale', 'Ventilation buccale'],
        ['deglutitionFonctionnelle', 'Déglutition fonctionnelle'],
        ['deglutitionAtypique', 'Déglutition atypique'],
        ['masticationBilaterale', 'Mastication bilatérale'],
        ['masticationUnilaterale', 'Mastication unilatérale'],
        ['phonationNormale', 'Phonation normale'],
        ['mobiliteMandibulaireNormale', 'Mobilité mandibulaire normale'],
        ['propulsionSansGlissement', 'Propulsion sans glissement'],
        ['lateralitesSansGlissement', 'Latéralités sans glissement'],
        ['absenceDouleurBruitsArticulaires', 'Absence de douleur ou de bruits articulaires'],
      ],
    },
    {
      id: 'endoDentaire',
      title: '4. Examen endobuccal — Dentaire',
      items: [
        ['dentureTemporaire', 'Denture temporaire'],
        ['dentureMixte', 'Denture mixte'],
        ['denturePermanente', 'Denture permanente'],
        ['anomalieNombre', 'Anomalie de nombre'],
        ['agenesie', 'Agénésie'],
        ['dentSurnumeraire', 'Dent surnuméraire'],
        ['anomalieFormeVolume', 'Anomalie de forme ou de volume'],
        ['retardEruption', "Retard d'éruption"],
        ['inclusionDentaire', 'Inclusion dentaire'],
        ['carieOuLesionDentaire', 'Carie ou lésion dentaire'],
        ['atteinteParodontale', 'Atteinte parodontale'],
        ['hygieneBuccoDentaireInsuffisante', 'Hygiène bucco-dentaire insuffisante'],
      ],
    },
    {
      id: 'endoAlignement',
      title: '4. Examen endobuccal — Alignement',
      items: [
        ['alignementSatisfaisant', 'Alignement satisfaisant'],
        ['encombrementMaxillaire', 'Encombrement maxillaire'],
        ['encombrementMandibulaire', 'Encombrement mandibulaire'],
        ['diastemes', 'Diastèmes'],
        ['rotationDentaire', 'Rotation dentaire'],
        ['versionDentaire', 'Version dentaire'],
        ['decalageMilieuxInterIncisifs', 'Décalage des milieux inter-incisifs'],
        ['courbeSpeeAccentuee', 'Courbe de Spee accentuée'],
        ['courbeSpeeInversee', 'Courbe de Spee inversée'],
      ],
    },
    {
      id: 'occlusion',
      title: '5. Occlusion',
      items: [
        ['classeIMolaire', 'Classe I molaire'],
        ['classeIIMolaire', 'Classe II molaire'],
        ['classeIIIMolaire', 'Classe III molaire'],
        ['classeIICanine', 'Classe II canine'],
        ['classeIIICanine', 'Classe III canine'],
        ['surplombAugmente', 'Surplomb augmenté'],
        ['surplombInverse', 'Surplomb inversé'],
        ['beanceAnterieure', 'Béance antérieure'],
        ['beanceLaterale', 'Béance latérale'],
        ['supraclusion', 'Supraclusion'],
        ['articuleCroiseAnterieur', 'Articulé croisé antérieur'],
        ['articuleCroisePosterieur', 'Articulé croisé postérieur'],
        ['endocclusionMaxillaire', 'Endocclusion maxillaire'],
        ['lateroDeviationMandibulaire', 'Latéro-déviation mandibulaire'],
        ['glissementAnterieurLateral', 'Glissement antérieur ou latéral'],
        ['interferencesOcclusales', 'Interférences occlusales'],
      ],
    },
    {
      id: 'croissance',
      title: '6. Croissance et bases osseuses',
      items: [
        ['croissanceTerminee', 'Croissance terminée'],
        ['croissanceEnCours', 'Croissance en cours'],
        ['potentielCroissanceFavorable', 'Potentiel de croissance favorable'],
        ['excesVerticalSquelettique', 'Excès vertical squelettique'],
        ['insuffisanceVerticaleSquelettique', 'Insuffisance verticale squelettique'],
        ['decalageSagittalMaxilloMandibulaire', 'Décalage sagittal maxillo-mandibulaire'],
        ['decalageTransversal', 'Décalage transversal'],
        ['asymetrieSquelettique', 'Asymétrie squelettique'],
        ['indicationEvaluationMaturationSquelettique', "Indication d'évaluation de la maturation squelettique"],
      ],
    },
    {
      id: 'documents',
      title: '7. Documents complémentaires',
      items: [
        ['photosExtraOrales', 'Photographies extra-orales'],
        ['photosIntraOrales', 'Photographies intra-orales'],
        ['modelesEmpreintesNumeriques', 'Modèles ou empreintes numériques'],
        ['panoramiqueDentaire', 'Panoramique dentaire'],
        ['teleradiographieProfil', 'Téléradiographie de profil'],
        ['analyseCephalometrique', 'Analyse céphalométrique'],
        ['teleradiographieFace', 'Téléradiographie de face si asymétrie ou problème transversal'],
        ['cbctIndicationCiblee', 'CBCT uniquement si indication ciblée'],
        ['bilanORL', 'Bilan ORL'],
        ['bilanOrthophonique', 'Bilan orthophonique'],
        ['avisOdontoParoChirurgical', 'Avis odontologique, parodontal ou chirurgical si nécessaire'],
      ],
    },
    {
      id: 'synthese',
      title: '8. Synthèse diagnostique',
      items: [
        ['anomaliePrincipalementDentaire', 'Anomalie principalement dentaire'],
        ['anomalieAlveolaire', 'Anomalie alvéolaire'],
        ['anomalieSquelettique', 'Anomalie squelettique'],
        ['anomalieFonctionnelle', 'Anomalie fonctionnelle'],
        ['anomalieTransversale', 'Anomalie transversale'],
        ['anomalieSagittale', 'Anomalie sagittale'],
        ['anomalieVerticale', 'Anomalie verticale'],
        ['asymetrie', 'Asymétrie'],
        ['risqueCarieuxParodontal', 'Risque carieux ou parodontal'],
        ['retentissementEsthetique', 'Retentissement esthétique'],
        ['retentissementFonctionnel', 'Retentissement fonctionnel'],
        ['retentissementTraumatique', 'Retentissement traumatique'],
        ['diagnosticOrthodontiqueEtabli', 'Diagnostic orthodontique établi'],
        ['bilanComplementaireNecessaire', 'Bilan complémentaire nécessaire avant conclusion'],
      ],
    },
  ],
};

/** Retourne la liste à plat de toutes les clés préfixées "groupe_item". */
export function flatFieldKeys(formDef) {
  const keys = [];
  for (const group of formDef.groups) {
    for (const [key] of group.items) {
      keys.push(`${group.id}_${key}`);
    }
  }
  return keys;
}
