class NavigationUtils{
  // Beware: this function creates a snapshot of the current script *WHEN CALLED*
  static createCurrentScriptURLSnapshot(){
    return new URL(document.currentScript.src);
  }

  static getURLRelativeToSource(path, sourceURL, verbose = false){
    if (verbose)
      console.log(`Fetching resource from ${sourceURL}, with path ${path}`)

    return new URL(path, sourceURL).href;
  }
}
