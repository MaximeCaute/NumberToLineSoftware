class SavingUtils {
  static saveLocal(jsPsych, subjectID){
    console.log("Saving data locally !")
    jsPsych.data.get().localSave('csv',subjectID+".csv");
  }

  // Requires a functional write_data.php
  static saveDataPHPWithPromise(name, data, numberOfTrials = 3){
    console.log("Saving data via PHP!")

    async function trySend(trialsLeft){
      console.log("Trying to send data.");

      const response = await fetch('../write_data.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileprefix: name, filedata: data })
      });

      if (!response.ok) {
        console.log("Failed to save file!");

        if (trialsLeft <= 0){
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

  static saveDataPHP(name, data, numberOfTrials = 3, callback = function(){}){
    SavingUtils.saveDataPHPWithPromise(name, data, numberOfTrials).
      then((response) => {
        console.log("File save response:");
        console.log(response);

        if (!response.ok){
          document.body.innerHTML = ""

          // We create HTML content via javascript
          // This because we don't know the name of the callback
          // So it cannot be used as <button onclick="...">
          let errorMessageContainer = document.createElement("div");
          errorMessageContainer.style.display = "flex";
          errorMessageContainer.style.flexDirection = "column";
          errorMessageContainer.style.justifyContent = "center";
          errorMessageContainer.style.alignItems = "center";
          errorMessageContainer.style.width = "100%";
          errorMessageContainer.style.height = "100%";

          let errorMessage = document.createElement("p");
          errorMessage.innerHTML = localizer.getMessage("RESPONSES_NOT_SAVED")
          errorMessageContainer.appendChild(errorMessage);

          let continueButton = document.createElement("button");
          continueButton.innerHTML = localizer.getMessage("NEXT")
          continueButton.onclick = callback;
          continueButton.style.width = "min-content";
          errorMessageContainer.appendChild(continueButton);

          document.body.appendChild(errorMessageContainer);
        } else {
          callback();
        }
      });
  }
}
