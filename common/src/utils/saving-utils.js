class SavingUtils {
  static saveLocal(jsPsych, subjectID){
    console.log("Saving data locally !")
    jsPsych.data.get().localSave('csv',subjectID+".csv");
  }

  // Requires a functional write_data.php
  static saveDataPHP(name, data){
    console.log("Saving data via PHP!")

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../write_data.php');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({fileprefix: name, filedata: data}));
  }
}
