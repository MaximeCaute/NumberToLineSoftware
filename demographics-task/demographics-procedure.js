function createIdentificationProcedure(jsPsych, localizer){

  let ageSurvey = {
    type: jsPsychSurveyText,
    questions: [{
      prompt: "Quelle est ta date de naissance (jour/mois/année, par ex. 14/07/2010)?",
      name: "birthDate"
    }],
    on_finish: function(data){
      let birthDate = new Date(data.response.birthDate.split("/").reverse());
      let currentDate = new Date(Date.now());
      data.response.birthDate = undefined;
      data.response.ageInMonths =
        (currentDate.getUTCFullYear() - birthDate.getUTCFullYear()) * 12
        + (currentDate.getMonth() - birthDate.getMonth());
    }
  }

  let sexSurvey = {
    type: jsPsychSurveyMultiChoice,
    questions: [{
      prompt: "Tu es :",
      name: "sex",
      options: ["une fille", "un garçon", "je ne veux pas répondre"],
      required: true
    }]
  };

  return {
    timeline: [ageSurvey, sexSurvey],
    save_trial_parameters: {question_order: false}
  };
}
