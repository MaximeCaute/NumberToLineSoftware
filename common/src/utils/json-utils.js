jsonUtils = {
  copyTrial: function(trial, copyType = false){
    var trialCopy = JSON.parse(JSON.stringify(
        trial,
        function(key, value){return key == "type" ? undefined : value}
      ));
    if(copyType)
      trialCopy.type = trial.type;

    return trialCopy
  }
}
