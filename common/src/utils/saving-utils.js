class SavingUtils {
  static saveLocal(jsPsych, subjectID){
    console.log("Saving data locally !")
    jsPsych.data.get().localSave('csv',subjectID+".csv");
  }

  // Requires a functional write_data.php
  static saveDataPHP(name, data, timeout = 5000, numberOfTrials = 3){
    console.log("Saving data via PHP!")

    // function trySend(trialsLeft){
    //
    //   console.log(`${trialsLeft} trials left.`);
    //
    //   if (trialsLeft <= 0){
    //     console.log("No trials left for saving. Abandonning...");
    //     return;
    //   }
    //
    //   var xhr = new XMLHttpRequest();
    //   xhr.open('POST', '../write_data.php');
    //   xhr.setRequestHeader('Content-Type', 'application/json');
    //
    //   xhr.send(JSON.stringify({fileprefix: name, filedata: data}));
    //   xhr.onreadystatechange = function(){
    //     // No interest if not done.
    //     if (xhr.readyState !== xhr.DONE)
    //       return;
    //
    //     // Success
    //     if (xhr.status === 200){
    //       console.log("File successfully saved");
    //       return;
    //     }
    //
    //     console.log("Failure to save file!");
    //
    //     trySend(trialsLeft - 1)
    //   }
    // }
    //
    // trySend(numberOfTrials);

    async function trySend(trialsLeft){
      console.log("Trying to send data.");

      const response = await fetch('../write_data.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileprefix: name, filedata: data })
      });

      if (!response.ok) {
        console.log("Failed to save file!");

        if (trialsLeft == 0){
          console.log("No trials left for saving. Abandonning...");
          return response;
        }

        console.log(`${trialsLeft - 1} trials left. Retrying`);
        return await trySend(trialsLeft - 1)
      } else {
        console.log("Successfully saved data!")
        return response;
      }

    }

    return trySend(numberOfTrials)
  }
}
