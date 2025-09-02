class Renderer {
  constructor(type = "LINE", color = "black"){
    this.type = type;
    this.color = color;
  }

  static PANEL_ID = "line-display-panel";
  static RESPONSE_PANEL_ID = "response-panel";

  static assertParameterIsDefined(parameter, parameterName){
    if (parameter == undefined)
      throw new Error(`${parameterName} wasn't defined in the process!`);
  }

  static overwriteValueIfSetParameter(parameter, currentValue){
    return parameter == null ? currentValue : parameter;
  }

  static createTickAsElement(tick, relativePositionX, tickOffsetY, tickData){
    // INT VALUE FOR NOW
    let width = Renderer.overwriteValueIfSetParameter(tick.width, tickData.width);
    let color = Renderer.overwriteValueIfSetParameter(tick.color, tickData.color);
    let height = Renderer.overwriteValueIfSetParameter(tick.height, tickData.height);
    let labelFontSize = Renderer.overwriteValueIfSetParameter(tick.labelFontSize, tickData.labelFontSize);
    let labelDistanceToTick = Renderer.overwriteValueIfSetParameter(tick.labelDistanceToTick, tickData.labelDistanceToTick);

    let tickElement = document.createElement("div");
    tickElement.id = tick.value;
    {
      tickElement.style.width = width;
      tickElement.style.height = height;
      tickElement.style.backgroundColor = tickData.fillBackground ? color : "none";
      tickElement.style.position = "absolute";
      tickElement.style.transform = "translate(-50%, 0)";
      tickElement.style.left = `${100*relativePositionX}%`;
      tickElement.style.bottom = tickOffsetY;
    }

    if(tick.label != null){
      let tickLabel = document.createElement("p");
      tickLabel.innerHTML = tick.label;
      tickLabel.style.height = 0;
      tickLabel.style.color = color;
      tickLabel.style.fontSize = `${labelFontSize}px`;
      tickLabel.style.position = "absolute";
      tickLabel.style.transform = "translate(-50%, 0)";
      tickLabel.style.left = "50%";
      tickLabel.style.bottom = `calc(${height} + ${labelDistanceToTick})`;
      tickElement.appendChild(tickLabel);
    }

    return tickElement;
  }

  // We keep this static because we want the panel to be independant from type
  // TODO probably improvable
  static createPanel(verticalOffsetFromCenter, width, height){
    let panel = document.createElement("div");
    panel.id = Renderer.PANEL_ID;
    panel.style.width = width;
    panel.style.height = height;
    panel.style.position = "absolute";
    panel.style.transform = "translate(-50%, 0)";
    panel.style.left = "50%";
    panel.style.bottom = `calc(50% -
      ${height} -
      ${verticalOffsetFromCenter})`;

    return panel
  }

  renderTicks(panel, line, borderWidth, color){
    for (let tick of line.ticks){
      let tickData = this.tickDataFromType(tick.type);
      let tickRelativePositionX = (tick.value - line.min) / line.range();

      let tickVerticalOffset = borderWidth;

      let tickElement = Renderer.createTickAsElement(
        tick,
        tickRelativePositionX, tickVerticalOffset,
        tickData);

      tickElement.style.borderRight =
        `${tickData.borderWidth} ${tickData.linetype} ${color}`;

      panel.appendChild(tickElement);
    }
  }

  // NOT GREAT THAT HIS DECIDES ITS POSITION ?
  // TODO SEPARATE FUNCTIONALISM?
  createAsElement(line, distanceToCenter, innerPanelHeight, barWidth, borderWidth, color, responseMargin, isResponseAllowed){
    let panelHeight = `calc(${innerPanelHeight} + ${borderWidth})`;

    let responsePanel = Renderer.createPanel(
      `calc(${distanceToCenter} - ${responseMargin})`,
      `calc(${barWidth} + 2 * ${responseMargin})`,
      `calc(${panelHeight} + 2 * ${responseMargin})`)
    responsePanel.id = Renderer.RESPONSE_PANEL_ID;
    // responsePanel.style.backgroundColor = "lightblue"

    let displayPanel = Renderer.createPanel(
      distanceToCenter,
      barWidth,
      panelHeight)
    displayPanel.style.bottom = responseMargin;

    this.renderBody(displayPanel, line, barWidth, panelHeight, borderWidth, color)

    this.renderTicks(displayPanel, line, borderWidth, color);

    responsePanel.appendChild(displayPanel);

    responsePanel.computeRawAndRoundedAnswers = this.getComputeAnswersFunction(line, displayPanel, responsePanel);

    return responsePanel;
  }
}

class LineRenderer extends Renderer {
  constructor(color){
    super(LineRenderer.ID, color);
  }

  static ID = "LINE";

  tickDataFromType(tickType){
    let tickData = {color: this.color, fillBackground: true,
      labelFontSize: GUI_CONFIG.LABEL_FONT_SIZE,
      labelDistanceToTick: GUI_CONFIG.HEIGHT_BETWEEN_LABEL_AND_TICK};

    switch (tickType) {
      case NumberLine.tickTypes.MAJOR:
        tickData.width = GUI_CONFIG.MAJOR_TICKS_WIDTH;
        tickData.height = GUI_CONFIG.MAJOR_TICKS_HEIGHT;
        break;
      case NumberLine.tickTypes.INTERMEDIATE:
        tickData.width = GUI_CONFIG.INTERMEDIATE_TICKS_WIDTH;
        tickData.height = GUI_CONFIG.INTERMEDIATE_TICKS_HEIGHT;
        break;
      case NumberLine.tickTypes.MINOR:
        tickData.width = GUI_CONFIG.MINOR_TICKS_WIDTH;
        tickData.height = GUI_CONFIG.MINOR_TICKS_HEIGHT;
        break;
      default:
        throw new Error("Invalid tick type!");
    }

    Renderer.assertParameterIsDefined(tickData.width, "Width");
    Renderer.assertParameterIsDefined(tickData.height, "Height");

    return tickData;
  }

  renderBody(panel, line, panelWidth, panelHeight, borderWidth, color){
    let lineBar =  document.createElement("div");
    lineBar.id = "line-bar";
    lineBar.style.width = panelWidth;
    lineBar.style.height = borderWidth;
    lineBar.style.backgroundColor = color;
    lineBar.style.position = "absolute";
    lineBar.style.left = "0px";
    lineBar.style.bottom = "0px";
    panel.appendChild(lineBar);
  }

  getComputeAnswersFunction(line, displayPanel, responsePanel){
    return function(clickCoordinates, margin){
      if(!MathUtils.isInRect(clickCoordinates, responsePanel.getBoundingClientRect()))
        return

      let displayPanelBoundingRect = displayPanel.getBoundingClientRect();
      let relativeX = clickCoordinates.x - displayPanelBoundingRect.left;

      let rawResponse = line.min +
        line.range() * relativeX / displayPanelBoundingRect.width;
      // TODO, the margin should be tied to the div... still true ?
      let roundedResponse = line.getClosestTickValue(rawResponse, margin / line.range());

      return {raw: rawResponse, rounded: roundedResponse};
    }
  }
}
