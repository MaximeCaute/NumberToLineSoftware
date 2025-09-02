class Instructions {
  static toHTMLPages(localizer) {
    return [
      // TODO INSTRUCTIONS HERE
      localizer.getMessage("INSTRUCTIONS_TITLE", [" (1/3)"], "h1") +
      "<p></p>" +
      localizer.getMessage("INSTRUCTIONS_TEXT_1", [], "p") +
      `<img src="res/instructions-illustrations/LineIllustration.png" alt="line illustration" style= "width: calc(
        ${GUI_CONFIG.BAR_WIDTH} + 2 * ${GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_WIDTH}">`,

      // PAGE 2
      localizer.getMessage("INSTRUCTIONS_TITLE", [" (2/3)"], "h1") +
      `<p></p>`+
      localizer.getMessage("INSTRUCTIONS_DISPLAY", [], "p") +
      `<img src="res/instructions-illustrations/ButtonClickIllustration.png" alt="cardboard illustration" style="height: calc(
        ${GUI_CONFIG.CARDBOARD_PANEL_SIZE} + ${GUI_CONFIG.CARDBOARD_HANDLE_LENGTH})">`,

      // PAGE 3
      localizer.getMessage("INSTRUCTIONS_TITLE", [" (3/3)"], "h1") +
      `<p></p>` +
      localizer.getMessage("INSTRUCTIONS_RESPONSE", [], "p") +
      `<img src="res/instructions-illustrations/ResponseIllustrationEN.png" alt="click illustration" style= "width: calc(
        ${GUI_CONFIG.BAR_WIDTH} + 2 * ${GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_WIDTH})">` +
      localizer.getMessage("INSTRUCTIONS_RESPONSE_TIME", [Math.round(TRIAL_TIME_LIMIT / 1000)], "p") +
      localizer.getMessage("INSTRUCTIONS_RECORDING", [], "p"),
    ];
  }
}
