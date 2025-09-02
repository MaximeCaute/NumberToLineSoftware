class QueryDict {
  static readQueries(){
    const queryDict = {};
    location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})

    return queryDict
  }

  static parseBoolean(value){
    let capsValue = value.toUpperCase()

    if (capsValue == "TRUE")
      return true
    if (capsValue == "FALSE")
      return false

    throw new Error(`${value} is not valid for a boolean`)
  }
}
