var HTML_UTILS = {
  ReplaceBackgroundColour: function(div, sourceColour, targetColour){
    if (div.style.backgroundColor == sourceColour)
      div.style.backgroundColor = targetColour;

    for (let child of div.children){
      HTML_UTILS.ReplaceBackgroundColour(child, sourceColour, targetColour);
    }
  }
}
