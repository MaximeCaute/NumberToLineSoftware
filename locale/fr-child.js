class ChildFrenchLocalizer extends Localizer {
  constructor(){
    super();

    this.messages = {
      "ID_QUERY": "Merci d'entrer ton identifiant."
      "RANDOM_ID_GENERATED": `Un identifiant aléatoire t'a été assigné :</p><p>${Localizer.FORMATTABLE_MARKER}`,


      "FULLSCREEN_PROMPT": "Prêt à commencer ?",
      "FULLSCREEN_LABEL": "Oui !",


      "SPACE_BAR": `<b>[ESPACE]</b>`,
      "PRESS_ANY_KEY": `Appuie sur n'importe quelle touche pour continuer.`,
      "START": "Commencer",
      "PREVIOUS": "Précédent",
      "NEXT": "Continuer",
      "TERMINATE": "Terminer",

      "NEW_LINE": `La ligne ira de <strong>${Localizer.FORMATTABLE_MARKER} à ${Localizer.FORMATTABLE_MARKER}</strong>.`,
      "VISUAL_MODALITY_DISPLAY": `Les nombres <strong>s'afficheront</strong> sur la pancarte.`,
      "AUDITORY_MODALITY_DISPLAY": `Les nombres te seront <strong>dictés</strong>.`,
      "TRAINING_START": `Entraînons-nous un peu. Un son te dira si tu as bien répondu.`,
      "TRAINING_FINISHED": "Tu as maintenant fini l'entraînement.",
      "NO_CORRECTION": `Les prochains nombres ne seront plus corrigés, même si tu fais des erreurs.`,

      // "ACCURACY_DESCRIPTION_NONE": `Tu n'as pas réussi à placer de nombre...`,
      // "ACCURACY_DESCRIPTION_SINGULAR": `Tu as réussi à placer ${Localizer.FORMATTABLE_MARKER} nombre sur ${Localizer.FORMATTABLE_MARKER}.`,
      // "ACCURACY_DESCRIPTION_PLURAL": `Tu as réussi à placer ${Localizer.FORMATTABLE_MARKER} nombres sur ${Localizer.FORMATTABLE_MARKER}.`,
      "ACCURACY_DESCRIPTION": `Tu as réussi à placer ${Localizer.FORMATTABLE_MARKER}% des nombres.`,
      "ENCOURAGEMENT_POOR": `Ce n'est pas grave, tu feras mieux par la suite !`,
      "ENCOURAGEMENT_GOOD": `C'est bien, mais tu peux faire encore mieux !`,
      "CONGRATULATIONS": `Félicitations, continue comme ça !`,
      "BLOCK_ENDED": `Bravo ! Tu as terminé cette partie !`,

      "NUMBER_TO_LINE_EXPERIENCE_ENDED": `Tu as fini ce jeu, clique sur le bouton ci-dessous pour continuer !`,
      "RESPONSES_SAVED": `Tes réponses ont bien été enregistrées. <strong>Merci !</strong>`,

      "INSTRUCTIONS_TITLE": `Instructions${Localizer.FORMATTABLE_MARKER}`,
      "INSTRUCTIONS_TEXT_1": `Dans cet exercice, tu verras une ligne numérique graduée.`,
      "INSTRUCTIONS_DISPLAY": `Il y aura un bouton au dessus de cette ligne. Tu cliqueras sur le bouton pour avoir un nombre. Le nombre sera soit affiché sur la pancarte, soit dicté dans ton casque par une voix.`,
      "INSTRUCTIONS_RESPONSE": `<b> Place ce nombre à la bonne position sur la ligne !</b> Déplace la pancarte sur la ligne, puis clique à nouveau pour la lâcher au bon endroit !`,
      "INSTRUCTIONS_RESPONSE_TIME": `Essaie de répondre dès que tu as la (bonne) réponse. Tu auras environ <strong>${Localizer.FORMATTABLE_MARKER} secondes</strong> à chaque fois.`,
      "INSTRUCTIONS_RECORDING": `Nous enregistrerons ta précision et ton temps de réponse.
                                  Ce n'est pas grave si tu fais une erreur ;
                                  fais simplement de ton mieux pour répondre correctement !`,

      "SMALLER": "PLUS PETIT",
      "GREATER": "PLUS GRAND",

      "WHOLE_NUMBER_SCORE_FEEDBACK": `Tu as réussi à placer ${Localizer.FORMATTABLE_MARKER}% des nombres entiers.`,
      "DECIMAL_SCORE_FEEDBACK": `Tu as réussi à placer ${Localizer.FORMATTABLE_MARKER}% des nombres décimaux.`,
      "FRACTION_SCORE_FEEDBACK": `Tu as réussi à placer ${Localizer.FORMATTABLE_MARKER}% des fractions.`,
      "POINTS_SCORE_FEEDBACK": `Tu as marqué <strong>${Localizer.FORMATTABLE_MARKER} points</strong> sur ${Localizer.FORMATTABLE_MARKER}.
        Continue de t'entraîner pour progresser !`,

      "THANK_YOU": "Merci de ta participation !",
      "MORE_DETAILS_ON_ERRORS": "Voyons plus en détail les erreurs que tu as faites !",
    };
  }
}
