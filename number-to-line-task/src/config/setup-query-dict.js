if (!queryDict.debug || ["F", "False", "FALSE", "f", "false"].includes(queryDict.debug)){
  queryDict.debug = false;
} else {
  queryDict.debug = true;
}

if (queryDict.line){
  queryDict.lineMinimum = parseInt(queryDict.line.split("-")[0])
  queryDict.lineMaximum = parseInt(queryDict.line.split("-")[1])
  queryDict.modality = queryDict.line.split("-")[2]

  if (queryDict.modality == "verbal"){
    queryDict.modality = VERBAL_MODALITY;
  } else {
    queryDict.modality = VISUAL_MODALITY;
  }

  if (isNaN(queryDict.lineMinimum))
    queryDict.lineMinimum = 0;
  if (isNaN(queryDict.lineMaximum))
    queryDict.lineMaximum = 7;
}

if (["F", "False", "FALSE", "f", "false"].includes(queryDict.training)){
  queryDict.training = false;
} else {
  queryDict.training = true;
}
