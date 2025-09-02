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
  static getCurrentCoordinates(cardboardHandleEndId = Cardboard.HANDLE_END_ID){
    return MathUtils.computeRectCenter(
      document.getElementById(cardboardHandleEndId).getBoundingClientRect()
    );
  }

  static createCarboardMovementFunction(cardboardDiv, snapZone, snapTargetY, regularHandleLengthMeasure){
    if (typeof(regularHandleLengthMeasure) != typeof(""))
      throw new TypeError("regularHandleLengthMeasure should be a string specifying the unit!")

    return function(e){
      let updatedYPos = e.clientY + cardboardDiv.clickToReferenceOffset
      let isInSnapZone = MathUtils.isInRect({x:e.clientX, y:e.clientY}, snapZone);

      if (isInSnapZone){
        // TODO improve
        let responseLineBottom = snapTargetY;
        cardboardDiv.setHandleLength(
          `calc(${regularHandleLengthMeasure} - (${updatedYPos - responseLineBottom}px))`)
        cardboardDiv.moveToPosition(e.clientX, responseLineBottom);
      } else {
        cardboardDiv.setHandleLength(regularHandleLengthMeasure);
        cardboardDiv.moveToPosition(e.clientX, updatedYPos)
      }
    }
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

  // createHTMLComponents(){
  //   return {
  //     panel: this.createPanel(),
  //     handle: this.createHandle(),
  //     handleEnd: this.createHandleEnd(),
  //   }
  // }

  createAsDiv(displayFunction, onClick, snapZoneDiv, alreadyClicked = false, displayStimulusImmediately = false){
    let cardboardDiv = Cardboard.createDiv(this.panelWidth,
      this.getTotalHeight());
    cardboardDiv.id = "cardboard";
    cardboardDiv.activated = false;
    cardboardDiv.canMove = true;

    let panel = this.createPanel()
    cardboardDiv.appendChild(panel);

    if (displayStimulusImmediately)
      displayFunction(panel);

    let handle = this.createHandle();
    cardboardDiv.appendChild(handle);

    let handleEnd = this.createHandleEnd();

    let handleEndRadius = this.handleEndRadius;

    cardboardDiv.getCurrentCoordinates = () => {
      return MathUtils.computeRectCenter(handleEnd.getBoundingClientRect());
    };

    cardboardDiv.moveToPosition = function(x, y){
      cardboardDiv.style.left = `${x}px`;
      cardboardDiv.style.top = `calc(${y}px - (${cardboardDiv.style.height} - ${handleEnd.style.height} / 2))`;
    }

    // Does not move the handleEndDot
    // LengthMeasure is with units!
    cardboardDiv.setHandleLength = function(lengthMeasure){
      // Shift the cardboard up
      cardboardDiv.style.top = `calc(${cardboardDiv.style.top} - (${lengthMeasure} - ${handle.style.height}))`
      // Increase the length
      handle.style.height = `${lengthMeasure}`;
      // Update container height
      cardboardDiv.style.height = `calc(${panel.style.height} + ${handle.style.height})`
    }

    let cardboard = this;
    // TODO DOes not work for button because bounding rects not initialized
    let activate = function(initialClickElement){

      cardboardDiv.activated = true;

      // TODO All this can probably be cleaned
      onClick(cardboardDiv);
      if(!displayStimulusImmediately)
        displayFunction(panel);

      handleEnd.style.cursor = "none";
      document.body.style.cursor = "none";

      // Todo this kills the click on button start option (but the movement is smooth)
      // TODO not perfect to use top.
      let offsetFromReference = handleEnd.getBoundingClientRect().top
          - MathUtils.computeRectCenter(initialClickElement.getBoundingClientRect()).y

      cardboardDiv.clickToReferenceOffset = offsetFromReference;
    };

    if(alreadyClicked){
      // if it appears already clicked, then the reference should be at the center of the panel
      activate(panel);
    } else {
      handleEnd.onclick = function(){
        //if it needs you to click the handleEnd...
        activate(handleEnd)
      };
    }

    cardboardDiv.appendChild(handleEnd);

    return cardboardDiv;
  }
}
