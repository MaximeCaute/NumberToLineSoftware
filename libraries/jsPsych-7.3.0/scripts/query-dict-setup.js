// Queries
const queryDict = {};
location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
// TODO ADD POSSIBILITY TO SET TRUE & FALSE

// Language options
if (!queryDict.lang)
{
  queryDict.lang = "en";
}

// Should we send it to NeuroSpin, or save locally?
queryDict.localSave = queryDict.localSave ? false : true;
queryDict.sendData = queryDict.sendData ? false : true;

// Debug options (should skip consent, demographics...)
if (!queryDict.debug)
{
  queryDict.debug = false;
}
else
{
  queryDict.debug = true;

  // If it is debug it is not a real test: DO NOT SEND DATA!
  queryDict.sendData = false;
}

// Training should be skippable
if(!queryDict.excludeTraining)
{
  queryDict.excludeTraining = false;
}
else
{
  queryDict.excludeTraining = true;

  // If there's no training it is not a real test: DO NOT SEND DATA!
  queryDict.sendData = false;
}

console.log("Query dictionary successfully set up!");
