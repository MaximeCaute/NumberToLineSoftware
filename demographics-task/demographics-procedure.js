function createIdentificationProcedure(jsPsych, localizer){

  // let ageSurvey = {
  //   type: jsPsychSurveyText,
  //   questions: [{
  //     prompt: "Quelle est ta date de naissance (jour/mois/année, par ex. 14/07/2010)?",
  //     name: "birthDate"
  //   }],
  //   on_finish: function(data){
  //     let birthDate = new Date(data.response.birthDate.split("/").reverse());
  //     let currentDate = new Date(Date.now());
  //     data.response.birthDate = undefined;
  //     data.response.ageInMonths =
  //       (currentDate.getUTCFullYear() - birthDate.getUTCFullYear()) * 12
  //       + (currentDate.getMonth() - birthDate.getMonth());
  //   }
  // }

  let ageSurvey = {
    type: jsPsychSurveyHtmlForm,
    on_load: function(){
      let input = document.getElementById('date-input');
      input.addEventListener('input', (event) => {
        let value = event.target.value.replace(/[^0-9]/g, ''); // only digits
        // Mid slashes
        if (value.length >= 2 && value.length < 4) {
          value = value.slice(0,2) + '/' + value.slice(2);
        } else if (value.length >= 4) {
          value = value.slice(0,2) + '/' + value.slice(2,4) + '/' + value.slice(4);
        }
        event.target.value = value;
      });
    },
    html: `
      <div style="margin:30px;">
        <p>${localizer.getMessage("DATE_OF_BIRTH_QUERY")}</p>
        <input id="date-input" type="text" name="birthDate" maxlength="10" placeholder="${localizer.getMessage("DATE_FORMAT_DDMMYYYY")}"
          style="font-size: 24px; text-align: center; width: 200px;">
        <p>${localizer.getMessage("DATE_OF_BIRTH_QUERY_SAVE_INFO")}</p>
      </div>
    `,
    button_label: localizer.getMessage("NEXT"),
    on_finish: function(data){
      console.log(data)
      let birthDate = new Date(data.response.birthDate.split("/").reverse());
      let currentDate = new Date(Date.now());
      data.response.birthDate = undefined;
      data.response.ageInMonths =
        (currentDate.getUTCFullYear() - birthDate.getUTCFullYear()) * 12
        + (currentDate.getMonth() - birthDate.getMonth());
    }
  };

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
