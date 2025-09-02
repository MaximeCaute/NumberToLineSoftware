document.addEventListener("DOMContentLoaded", function()
  {
    if(queryDict.sendData)
    {
      //distantSavingUtils.sendData(subjectID, "mcLoTVisualSequences", "VisualSequence", "ping");
      console.log("Pinging server");
    }

    jsPsych.run(timeline);
  });
