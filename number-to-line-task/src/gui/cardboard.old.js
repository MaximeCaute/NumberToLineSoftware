class Cardboard{
  constructor(color,
              panelWidth, panelHeight,
              handleWidth, handleLength,
              handleEndRadius,
              handleDotRadius, handleDotColor){
    this.color = color;
    this.panelWidth = panelWidth;
    this.panelHeight = panelHeight;
    this.handleWidth = handleWidth;
    this.handleLength = handleLength;
    this.handleEndRadius = handleEndRadius;
    this.handleDotRadius = handleDotRadius;
    this.handleDotColor = handleDotColor;
  }

  static FULL_DIV_ID = "cardboard";
  static PANEL_ID = "cardboard-panel";
  static HANDLE_END_ID = "cardboard-handle-end";
  static HANDLE_ID = "cardboard-handle";

  // TODO CLEAN
  static createDiv(width, height,
    flags = {id: "my-div", position: "absolute", transform: "translate(-50%, 0)", left: "50%"}){
    let div = document.createElement("div");
    div.id = flags.id;
    div.style.width = width;
    div.style.height = height;
    div.style.position = flags.position;
    div.style.transform = flags.transform;
    div.style.left = flags.left

    return div;
  }

  // Coordinates for the response (handle end dot)
  static getCurrentCoordinates(){
    return MathUtils.computeRectCenter(
      document.getElementById(Cardboard.HANDLE_END_ID).getBoundingClientRect()
    );
  }

  getTotalHeight(){
    return `calc(${this.panelHeight} + ${this.handleLength})`;
  }

  createPanel(){
    // Nota : We can print an empty image to get the cardboard size right?
    let panel = Cardboard.createDiv(this.panelWidth, this.panelHeight);
    panel.id = Cardboard.PANEL_ID;
    panel.style.backgroundColor = this.color;
    panel.style.top = "0px";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.justifyContent = "center";
    panel.style.alignItems = "top"
    return panel;
  }

  createHandle(){
    let handle = Cardboard.createDiv(this.handleWidth, this.handleLength);
    handle.id = Cardboard.HANDLE_ID;
    handle.style.backgroundColor = this.color;
    handle.style.bottom = "0px";
    return handle;
  }

  createHandleEnd(){
    let handleEnd = Cardboard.createDiv(this.handleEndRadius, this.handleEndRadius)
    handleEnd.id = Cardboard.HANDLE_END_ID;
    handleEnd.style.borderRadius = "50%";
    handleEnd.style.backgroundColor = this.color;
    handleEnd.style.bottom = "0px";

    handleEnd.style.cursor = "pointer";

    handleEnd.appendChild(this.createHandleDot());

    return handleEnd
  }

  createHandleDot(){
    let handleDot = Cardboard.createDiv(
      this.handleDotRadius, this.handleDotRadius);
    handleDot.style.transform = "translate(-50%, -50%)"
    handleDot.style.borderRadius = "50%";
    handleDot.style.backgroundColor = this.handleDotColor;
    handleDot.style.top = "50%";

    return handleDot
  }

  createAsDiv(displayStimulus, snapZoneDiv, alreadyClicked = false){
    let cardboardDiv = Cardboard.createDiv(this.panelWidth,
      this.getTotalHeight());
    cardboardDiv.id = "cardboard";
    cardboardDiv.activated = false;

    let panel = this.createPanel()
    cardboardDiv.appendChild(panel);

    let handle = this.createHandle();
    cardboardDiv.appendChild(handle);

    let handleEnd = this.createHandleEnd();

    let handleEndRadius = this.handleEndRadius;

    let cardboard = this;

    let activate = function(){

      cardboardDiv.activated = true;
      displayStimulus(panel);

      handleEnd.style.cursor = "none";
      document.body.style.cursor = "none";

      document.body.onmousemove = (e) => {

        let cardboardCurrentHeight = cardboardDiv.getBoundingClientRect().height;
        let panelCurrentHeight = panel.getBoundingClientRect().height;
        let cardboardIntendedTop = e.clientY - panelCurrentHeight / 2;
        let responseLineBottom = document.getElementById(Renderer.RESPONSE_PANEL_ID).getBoundingClientRect().bottom;

        let panelIntendedBottom = cardboardIntendedTop + panelCurrentHeight;

        cardboardDiv.style.height = cardboard.getTotalHeight();
        handle.style.height = cardboard.handleLength;

        let useSnap = MathUtils.isInRect(Cardboard.getCurrentCoordinates(), snapZoneDiv.getBoundingClientRect());

        // If the bottom of the panel crosses threshold
        if (useSnap) {
          // Compute here to avoid graphical bugs
          let cardboardIntendedHeight = responseLineBottom - cardboardIntendedTop;
          let handleIntendedHeight = cardboardIntendedHeight - panelCurrentHeight;

          // MOVE
          cardboardDiv.style.height = `${cardboardIntendedHeight}px`;
          handle.style.height = `${handleIntendedHeight}px`; // SECURITY MARGIN HERE
        }

        // MOVE
        cardboardDiv.style.left = `${e.clientX}px`;
        cardboardDiv.style.top = `${cardboardIntendedTop}px`;
      }
    };

    if(alreadyClicked){
      activate();
    } else {
      handleEnd.onclick = activate;
    }

    cardboardDiv.appendChild(handleEnd);

    return cardboardDiv;
  }
}
