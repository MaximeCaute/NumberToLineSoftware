// We initialize jsPsych
const jsPsych = initJsPsych({
  show_progress_bar: true,
  on_finish: function(data)
  {
    if(queryDict.localSave)
    {
      console.log("Saving data locally!");
      jsPsych.data.get().localSave('csv',subjectID+".csv");
    }

    if(queryDict.sendData)
    {
      var data_csv = jsPsych.data.get().csv();
      //distantSavingUtils.sendData(subjectID, "mcLoTVisualSequences", "VisualSequence", data_csv);
      console.log("Sending data to server...");
    }

    document.getElementById("jspsych-content").innerHTML = "<p>Vos réponses ont bien été enregistrées. <strong>Merci !</strong></p>";
  }
});

// Every experiment should save the ID of the subject, and their screen parameters.
var subjectID = jsPsych.randomization.randomID(10);

jsPsych.data.addProperties({'ID': subjectID});
jsPsych.data.addProperties({'screenX': screen.width});
jsPsych.data.addProperties({'screenY': screen.height});
jsPsych.data.addProperties({'innerX': window.innerWidth});
jsPsych.data.addProperties({'innerY': window.innerHeight});

// BLOCK DEFINITIONS

// Consent block.
var consent = {
  type: jsPsychExternalHtml,
  url: "external-consent-"+queryDict.lang+".html",
  cont_btn: "start"
};

// Fullscreen toggling block
var fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: "",
  button_label: "<h1 style='font-size: 5em'>" +
    (queryDict.lang === "fr" ? "Plein écran" : "Fullscreen") + "</h1>",
  on_finish: function(){
    document.body.style.cursor = "none"
  }
}

var timeline = [fullscreen];
