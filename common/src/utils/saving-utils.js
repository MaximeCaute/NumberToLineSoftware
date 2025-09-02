class SavingUtils {
  static saveLocal(jsPsych, subjectID){
    console.log("Saving data locally !")
    jsPsych.data.get().localSave('csv',subjectID+".csv");
  }
}
