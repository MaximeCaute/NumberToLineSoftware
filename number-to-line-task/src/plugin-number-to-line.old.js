var numberToLine = (function (jspsych) {
  "use strict";

  // TODO DELAY ON AUDIO STIMUL IWHEN GOING TO FAST...
  const info = {
    name: "numberToLine",
    parameters: {
      //// Main
      domainType: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
      },
      rangeMinimum: {
        type: jspsych.ParameterType.INT,
        default: undefined,
      },
      rangeMaximum: {
        type: jspsych.ParameterType.INT,
        default: undefined,
      },
      numberType: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
      },
      isTraining: {
        type: jspsych.ParameterType.BOOL,
        default: false,
      },
      numberFirstPart: {
        type: jspsych.ParameterType.INT,
        default: undefined,
      },
      numberSecondPart: {
        type: jspsych.ParameterType.INT,
        default: undefined,
      },
      minorGraduationInterval: {
        type: jspsych.ParameterType.FLOAT,
        default: undefined,
      },
      modality: {
        type: jspsych.ParameterType.STRING,
        default: ExperimentCore.VISUAL_MODALITY,
      },
      timeLimit:{
        type: jspsych.ParameterType.INT,
        default: -1,
      },
      useButtonForCardboardPopup:{
        type:jspsych.ParameterType.BOOL,
        default: true,
      },

      // DETAILS
      // TICKS
      majorGraduationInterval: {
        type: jspsych.ParameterType.FLOAT,
        default: MAJOR_GRADUATION_INTERVAL,
      },
      intermediateGraduationInterval: {
        type: jspsych.ParameterType.FLOAT,
        default: INTERMEDIATE_GRADUATION_INTERVAL,
      },
      useIntermediateTicks: {
        type: jspsych.ParameterType.BOOL,
        default: USE_HALVES_TICKS,
      },
      outOfLineSmallerResponsePanelText: {
        type: jspsych.ParameterType.STRING,
        default: null,
      },
      outOfLineGreaterResponsePanelText: {
        type: jspsych.ParameterType.STRING,
        default: null,
      },

      // Target
      imageFileDimension: {
        type: jspsych.ParameterType.INT,
        default: IMAGE_ORIGINAL_DIMENSION,
      },

      //// Details
      feedbackAnimationDuration: {
        type: jspsych.ParameterType.INT,
        default: FEEDBACK_ANIMATION_DURATION
      },
      timeBeforeFeedback: {
        type: jspsych.ParameterType.INT,
        default: TIME_BEFORE_FEEDBACK
      },
      afterTrialDelay: {
        type: jspsych.ParameterType.INT,
        default: AFTER_TRIAL_DELAY
      },
      useVerticalSnap:{
        type:jspsych.ParameterType.BOOL,
        default: USE_VERTICAL_SNAP,
      },
      useHorizontalSnap:{
        type:jspsych.ParameterType.BOOL,
        default: USE_HORIZONTAL_SNAP,
      },
      audioVoice: {
        type: jspsych.ParameterType.STRING,
        default: AUDIO_VOICES[0]
      },
    }
  };
  /**
   * **Bianry same-different pattern plugin**
   *
   * SHORT PLUGIN DESCRIPTION
   *
   * @author Maxime Cauté
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */


  class NumberToLinePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
      this.interrupt = false;
      this.responseElements = [];
    }

    trial(displayElement, trial) {
      let jsPsych = this.jsPsych;

      this.displayElement = displayElement;
      displayElement.innerHTML = "";
      trial.displayedStimulus = false;

      // We add another layer that will contain event listeners and be refreshed every trial
      let trialContextDiv = this.createContextDiv(displayElement)

      let target = this.createTarget(trial.numberType, trial.numberFirstPart, trial.numberSecondPart);

      // todo I dislike the target being used here...
      let lineElement = this.createLineElement(trial, target, displayElement);

      trialContextDiv.appendChild(lineElement);

      // Add response panels
      trialContextDiv.insertBefore(this.createOutOfLineResponsePanel(trial, true, target, trialContextDiv), lineElement);
      trialContextDiv.insertBefore(this.createOutOfLineResponsePanel(trial, false, target, trialContextDiv), lineElement);

      let displayStimulus = this.computeStimulusDisplay(target, trial);

      let startClickBoundingRect
      if(trial.useButtonForCardboardPopup){
        let cardboardPopupButton = this.createCardboardPopupButton(trialContextDiv, trial, displayStimulus);
        trialContextDiv.appendChild(cardboardPopupButton);

        startClickBoundingRect = cardboardPopupButton.getBoundingClientRect();
      } else {
        let cardboardElement = this.createCardboardElement(trial, displayStimulus);
        trialContextDiv.appendChild(cardboardElement);

        this.saveCardboardDetails(trial);

        startClickBoundingRect = document
                .getElementById(Cardboard.HANDLE_END_ID)
                .getBoundingClientRect();
      }

      this.saveGUIDetails(trial, startClickBoundingRect);

      this.setTimeLimit(trial);
      trial.startTime = Date.now();

      this.listenToResponseElements(trialContextDiv, trial);
    }

    createContextDiv(displayElement){
      let trialContextDiv = document.createElement("div");
      trialContextDiv.id = "trial-context";
      displayElement.append(trialContextDiv);
      document.body.style.cursor = "auto"

      trialContextDiv.style.height = "100vh";
      trialContextDiv.style.width = "100vw";
      trialContextDiv.style.backgroundColor = GUI_CONFIG.BACKGROUND_COLOR;

      return trialContextDiv;
    }

    saveGUIDetails(trial, startClickBoundingRect){
      trial.startClickX = startClickBoundingRect.left + startClickBoundingRect.width / 2;
      trial.startClickY = startClickBoundingRect.top + startClickBoundingRect.height / 2;

      let lineBoundingRect = document.getElementById(Renderer.PANEL_ID).getBoundingClientRect();

      trial.lineLeftBoundaryX = lineBoundingRect.left;
      trial.lineRightBoundaryX = lineBoundingRect.right;
      trial.lineTop = lineBoundingRect.top;
      trial.lineBottom = lineBoundingRect.bottom;
      // TODO There was an error here in the first experiment using width and not height !
      // WE still save it but this could be better with line top and bottom above.

      trial.lineY = lineBoundingRect.top + lineBoundingRect.height / 2;

    }

    saveCardboardDetails(trial){
      let cardboardPanelElement = document.getElementById(Cardboard.PANEL_ID);
      let cardboardHandleEndElement = document.getElementById(Cardboard.HANDLE_END_ID);

      if (cardboardPanelElement == null || cardboardHandleEndElement == null)
        return;

      // TODO
      let cardboardPanelRect = cardboardPanelElement.getBoundingClientRect();
      let cardboardHandleEndRect = cardboardHandleEndElement.getBoundingClientRect();
      trial.cardboardPanelCenterToResponseShift =
        cardboardHandleEndRect.top + cardboardHandleEndRect.height / 2 -
        (cardboardPanelRect.top + cardboardPanelRect.height / 2)
    }

    createCardboardElement(trial, displayStimulus, alreadyClicked = false){
      let cardboard = new Cardboard(GUI_CONFIG.CARDBOARD_BACKGROUND_COLOR,
        GUI_CONFIG.CARDBOARD_PANEL_SIZE, GUI_CONFIG.CARDBOARD_PANEL_SIZE,
        GUI_CONFIG.CARDBOARD_HANDLE_WIDTH, GUI_CONFIG.CARDBOARD_HANDLE_LENGTH,
        GUI_CONFIG.CARDBOARD_HANDLE_END_RADIUS,
        GUI_CONFIG.CARDBOARD_HANDLE_DOT_RADIUS, GUI_CONFIG.CARDBOARD_HANDLE_DOT_COLOR);

      let onCardboardClick = function(panel){
        if (trial.displayedStimulus)
          return

        trial.displayedStimulus = true;

        trial.cardboardClickTimeFromStart = Date.now() - trial.startTime;
        displayStimulus(panel);
      }

      let cardboardElement = cardboard.createAsDiv(onCardboardClick,
        document.getElementById(Renderer.RESPONSE_PANEL_ID),
        alreadyClicked);

      cardboardElement.style.bottom = `calc(50vh
        - (${GUI_CONFIG.CARDBOARD_PANEL_CENTER_FROM_VIEWPORT_CENTER})
        - ${GUI_CONFIG.CARDBOARD_HANDLE_LENGTH}
        - ${GUI_CONFIG.CARDBOARD_PANEL_SIZE} / 2)`;
      return cardboardElement;
    }

    createLineElement(trial, target, displayElement){
      let renderer = this.createRenderer(trial.domainType,
        GUI_CONFIG.BAR_COLOR, GUI_CONFIG.UNIT_BACKGROUND_COLORS);
      let handleSnap = this.handleSnap;
      let handleFeedback = this.handleFeedback;
      let computeCorrectAnswer = this.computeCorrectAnswer;

      let line = NumberLine.createLinearLine(trial.rangeMinimum, trial.rangeMaximum,
        trial.majorGraduationInterval, trial.intermediateGraduationInterval, trial.minorGraduationInterval, trial.useIntermediateTicks);

      let lineElement = renderer.createAsElement(
        line,
        GUI_CONFIG.BAR_TOP_FROM_VIEWPORT_CENTER,
        GUI_CONFIG.MAJOR_TICKS_HEIGHT, GUI_CONFIG.BAR_WIDTH, GUI_CONFIG.BAR_HEIGHT, GUI_CONFIG.BAR_COLOR,
        GUI_CONFIG.RESPONSE_MARGIN,
        function(){return trial.displayedStimulus});

      this.addResponseElement(lineElement, LINE_PRIORITY)

      return lineElement;
    }

    createOutOfLineResponsePanel(trial, isLeft, target, displayElement){
      let panelText = isLeft ?
        trial.outOfLineSmallerResponsePanelText :
        trial.outOfLineGreaterResponsePanelText;

      let outOfLineResponsePanel = new OutOfLineResponsePanel(
        isLeft,
        panelText,
        GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_HEIGHT, GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_WIDTH,
        GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_ARROW_BODY_HEIGHT, GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_ARROW_HEAD_WIDTH
      );

      let outOfLineResponsePanelDiv = outOfLineResponsePanel.createAsElement(
        GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_COLOR
      );

      outOfLineResponsePanelDiv.id = isLeft ? SMALLER_PANEL_ID : GREATER_PANEL_ID;

      outOfLineResponsePanelDiv.style.position = "absolute";
      outOfLineResponsePanelDiv.style.top = `calc(50%
        + (${GUI_CONFIG.BAR_TOP_FROM_VIEWPORT_CENTER})
        + (
          ${document.getElementById(Renderer.PANEL_ID).getBoundingClientRect().height}px
          - ${GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_HEIGHT}
        ) / 2)`;

      // We have to add a correction for the fact that we set the left of the panel
      // if we want to be left of the bar...
      let offsetSign = isLeft ? '-' : '+';
      outOfLineResponsePanelDiv.style.left = `calc(50% ${offsetSign}
        (
          ${GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_HORIZONTAL_OFFSET_FROM_LINE}
          + ${isLeft ? GUI_CONFIG.OUT_OF_LINE_RESPONSE_PANELS_WIDTH : "0px"}
          + ${GUI_CONFIG.BAR_WIDTH} / 2
          ))`;

      outOfLineResponsePanelDiv.computeRawAndRoundedAnswers =
        function(clickCoordinates, margin){
          let lineDisplayPanelBoundingRect = document.getElementById(Renderer.PANEL_ID).getBoundingClientRect();
          let relativeX = clickCoordinates.x - lineDisplayPanelBoundingRect.left;

          let rawResponse = trial.rangeMinimum +
            (trial.rangeMaximum - trial.rangeMaximum) * relativeX / lineDisplayPanelBoundingRect.width;

          return {raw: rawResponse,
            rounded:outOfLineResponsePanelDiv.id};}

      this.addResponseElement(outOfLineResponsePanelDiv, OUT_OF_LINE_RESPONSE_PANELS_PRIORITY)

      return outOfLineResponsePanelDiv;
    }

    createTarget(type, firstPart, secondPart){
      switch (type){
        case Fraction.ID:
          return new Fraction(firstPart, secondPart);
        case Decimal.ID:
          return new Decimal(firstPart, secondPart);
        case WholeNumber.ID:
          return new WholeNumber(firstPart);
      }
    }

    createRenderer(type, barColor, unitBackgroundColors){
      switch (type){
        case LineRenderer.ID:
          return new LineRenderer(barColor);
        case BarRenderer.ID:
          return new BarRenderer(barColor, unitBackgroundColors);
      }
    }

    createCardboardPopupButton(displayElement, trial, displayStimulus){
      let button = document.createElement("button");

      button.style.height = GUI_CONFIG.POPUP_BUTTON_HEIGHT;
      button.style.width = GUI_CONFIG.POPUP_BUTTON_WIDTH;

      button.style.position = "absolute";
      button.style.transform = "translate(-50%, 50%)"
      button.style.left = "50%";
      button.style.bottom = `calc(50vh
        - (${GUI_CONFIG.CARDBOARD_PANEL_CENTER_FROM_VIEWPORT_CENTER})
      )`;

      let createCardboardElement = this.createCardboardElement;
      let saveCardboardDetails = this.saveCardboardDetails;
      button.onclick = function(){
        let cardboardElement = createCardboardElement(trial, displayStimulus, true);
        displayElement.appendChild(cardboardElement);
        displayElement.removeChild(button);
        saveCardboardDetails(trial);
      }

      return button;
    }

    computeStimulusDisplay(target, trial){
      let pathName;
      switch(trial.modality){
        case VISUAL_MODALITY:
          pathName = target.toImageNameWithDimensions(
            trial.imageFileDimension, trial.imageFileDimension, FRACTION_IMAGE_PATH);
          return function(panel){
            panel.innerHTML = `<img src="${pathName}" alt="fraction">`;
          };
        case VERBAL_MODALITY:
        // TODO FACTORIZE
          let audioSpecification = trial.audioVoice == undefined ? "" : `_${trial.audioVoice}`;

          pathName = FRACTION_AUDIO_PATH + `${target.toImageName()}_SG${audioSpecification}.wav`;
          return function(panel){
            audioUtils.playFile(pathName);
          };
        default:
          throw new Error(`Illegal modality: ${trial.modality}!`);
      }
    }

    computeCorrectAnswer(trial){
      let target = this.createTarget(trial.numberType, trial.numberFirstPart, trial.numberSecondPart);

      if (trial.rangeMinimum > target.value)
        return SMALLER_PANEL_ID;
      if (trial.rangeMaximum < target.value)
        return GREATER_PANEL_ID;

      return target.value;
    }

    handleSnap(trial, roundedAnswer){
      let cardboard = document.getElementById(Cardboard.FULL_DIV_ID);

      if (trial.useVerticalSnap)
        this.snapVertically(cardboard);
      if (trial.useHorizontalSnap)
        this.snapHorizontally(cardboard, trial, roundedAnswer);
    }

    handleFeedback(answer, trial){
      if (trial.isTraining){
        let correctAnswer = this.computeCorrectAnswer(trial);
        this.giveCorrectiveFeedback(answer, trial);
      } else {
        HTML_UTILS.ReplaceBackgroundColour(document.getElementById(Cardboard.FULL_DIV_ID), GUI_CONFIG.CARDBOARD_BACKGROUND_COLOR, GUI_CONFIG.CARDBOARD_FROZEN_BACKGROUND_COLOR);
      }
    }

    // giveCorrectiveFeedback(correctAnswer, isCorrectAnswer, feedbackColour){
    giveCorrectiveFeedback(answer, trial){
      let correctAnswer = this.computeCorrectAnswer(trial);
      let isCorrectAnswer = answer == correctAnswer;
      let cardboard = document.getElementById(Cardboard.FULL_DIV_ID)

      audioUtils.playAudioFeedback(isCorrectAnswer, true);

      // Color the cardboard accordingly
      HTML_UTILS.ReplaceBackgroundColour(cardboard,
        document.getElementById(Cardboard.PANEL_ID).style.backgroundColor,
        isCorrectAnswer ? GUI_CONFIG.CARDBOARD_CORRECT_FEEDBACK_COLOUR : GUI_CONFIG.CARDBOARD_INCORRECT_FEEDBACK_COLOUR);

      // if the answer was already correct our job is done here
      if (isCorrectAnswer)
        return;

      let feedbackColour = GUI_CONFIG.LINE_FEEDBACK_COLOUR;
      let feedbackElement = document.getElementById(correctAnswer);

      if (correctAnswer == SMALLER_PANEL_ID || correctAnswer == GREATER_PANEL_ID){
        for (let child of feedbackElement.children){
          if (child.id == OutOfLineResponsePanel.ARROWHEAD_ID){
            child.style.borderColor = `transparent ${feedbackColour} transparent ${feedbackColour}`;
          } else {
            child.style.backgroundColor = feedbackColour;
          }
        }
      } else {
        feedbackElement.style.backgroundColor = feedbackColour;
      }

      let linePanelDivBoundingRect = document.getElementById(Renderer.PANEL_ID).getBoundingClientRect();

      // Move cardboard to correct position
      // TODO DUPLACATIED
      let targetRelativeX = (correctAnswer - trial.rangeMinimum)
                    / (trial.rangeMaximum - trial.rangeMinimum)
                    * linePanelDivBoundingRect.width;
      let targetPosition = linePanelDivBoundingRect.left + targetRelativeX

      if (correctAnswer == SMALLER_PANEL_ID){
        targetPosition = linePanelDivBoundingRect.left
          - document.getElementById(SMALLER_PANEL_ID).getBoundingClientRect().width / 2
      } else if (correctAnswer == GREATER_PANEL_ID) {
        targetPosition = linePanelDivBoundingRect.right
          + document.getElementById(SMALLER_PANEL_ID).getBoundingClientRect().width / 2
      }

      // lest portalSprite = document.createElement("img")

      cardboard.style.transformOrigin = "bottom left"
      // TODO CLEAN THAT WITH ANIMAITON BELOW
      cardboard.style.bottom = `calc(100vh - ${linePanelDivBoundingRect.bottom}px -
         ${document.getElementById(Cardboard.HANDLE_END_ID).getBoundingClientRect().height / 2}px`
      cardboard.style.top = null;

      let cardboardDuplicate = cardboard.cloneNode(true);
      cardboardDuplicate.id += "-duplicate";

      let cardboardAnimation = new Animation(new KeyframeEffect(
        cardboard,
        // MAY NOT BE SAFE TO USE ON SOME BROWSERS
        [{scale: 0, bottom: `calc(100vh - ${linePanelDivBoundingRect.bottom}px`}, {scale:1}],
        {duration: trial.feedbackAnimationDuration, fill: ["forwards"]}
      ));

      // TODO INVESTIGATE KEEPING this.displayeELMENT
      cardboard.parentNode.insertBefore(cardboardDuplicate, cardboard);

      let cardboardDuplicateAnimation = new Animation(new KeyframeEffect(
        cardboardDuplicate,
        // MAY NOT BE SAFE TO USE ON SOME BROWSERS
        [{scale: 1}, {scale:0, bottom: `calc(100vh - ${linePanelDivBoundingRect.bottom}px`}],
        {duration: trial.feedbackAnimationDuration, fill: ["forwards"]}
      ));


      let target = this.createTarget(trial.numberType, trial.numberFirstPart, trial.numberSecondPart);
      setTimeout(() => {
        if (trial.modality == VERBAL_MODALITY){
          let audioSpecification = trial.audioVoice == undefined ? "" : `_${trial.audioVoice}`;

          // NOTE, in this additional part pathname was not defined, contrary to above.
          let pathName = FRACTION_AUDIO_PATH + `${target.toImageName()}_SG${audioSpecification}.wav`;
          audioUtils.playFile(pathName);
        }


        cardboard.style.bottom = `calc(100vh - ${linePanelDivBoundingRect.bottom}px -
           ${document.getElementById(Cardboard.HANDLE_END_ID).getBoundingClientRect().height / 2}px`
        cardboard.style.scale = 0;
        cardboard.style.left = `${targetPosition}px`;
        HTML_UTILS.ReplaceBackgroundColour(cardboard, "red", "green");

        cardboardDuplicateAnimation.play();
        cardboardAnimation.play();
      }, trial.timeBeforeFeedback);
    }

    setTimeLimit(trial){
      if (trial.timeLimit <= 0)
        return

      let finishTrial = this.finishTrial;
      trial.endTimeout = setTimeout(function(){
        let trialData = jsonUtils.copyTrial(trial);
        trialData.correct = false;
        trialData.answered = false;

        finishTrial(trial, trialData, 0)
      }, trial.timeLimit);
    }

    tryHandleClick(responseElement, clickCoordinates, trial){
      let responsePanelBoundingRect = responseElement.getBoundingClientRect();

      if(!MathUtils.isInRect(clickCoordinates, responsePanelBoundingRect))
        return false;

      trial.rtFromStart = Date.now() - trial.startTime;
      trial.answered = true;
      trial.rt = trial.rtFromStart - trial.cardboardClickTimeFromStart;

      // TODO GET PRIORITY
      let actualResponse = responseElement.computeRawAndRoundedAnswers(clickCoordinates, trial.responseMargin);
      let correctAnswer = this.computeCorrectAnswer(trial);

      trial.rawResponse = actualResponse.raw;
      trial.roundedResponse = actualResponse.rounded;
      trial.correctAnswer = correctAnswer;

      if (typeof(correctAnswer) == typeof(0)){
        trial.correct = Math.abs(actualResponse.rounded - correctAnswer) < EPSILON
      } else {
        trial.correct = actualResponse.rounded == correctAnswer;
      }

      // TODO this may create bug if timeout too short
      this.handleSnap(trial, actualResponse.rounded);
      this.handleFeedback(actualResponse.rounded, trial);
      this.finishTrial(trial, jsonUtils.copyTrial(trial), trial.afterTrialDelay)

      return true;
    }

    getHandleEndDotPosition(){
      let handleEndDotBoundingRect = document
              .getElementById(Cardboard.HANDLE_END_ID)
              .getBoundingClientRect();

      return {
        x: handleEndDotBoundingRect.left + handleEndDotBoundingRect.width/2,
        y: handleEndDotBoundingRect.top + handleEndDotBoundingRect.height/2
      }
    }

    snapVertically(cardboardDiv){
      let lineResponsePanelDiv = document.getElementById(Renderer.RESPONSE_PANEL_ID);
      cardboardDiv.style.top = `${
          lineResponsePanelDiv.getBoundingClientRect().bottom
          - cardboardDiv.getBoundingClientRect().height}px`;
    }

    snapHorizontally(cardboardDiv, trialData, roundedAnswer){
      // This does not do anything if answer is not a number (e.g. a string for out of line response panels)
      if (typeof(roundedAnswer) == typeof(0)){
        let linePanelDivBoundingRect = document.getElementById(Renderer.PANEL_ID).getBoundingClientRect();

        let targetRelativeX = (roundedAnswer - trialData.rangeMinimum)
                  / (trialData.rangeMaximum - trialData.rangeMinimum)
                  * linePanelDivBoundingRect.width;

        cardboardDiv.style.left = `${linePanelDivBoundingRect.left + targetRelativeX}px`;
      }
    }

    addResponseElement(element, priority){
      if(this.responseElements[priority] == undefined) {
        this.responseElements[priority] = [element];
      } else {
        this.responseElements[priority].push(element);
      }
    }

    listenToResponseElements(displayElement, trial){
      let tryHandleClick = this.tryHandleClick;
      let getHandleEndDotPosition = this.getHandleEndDotPosition;
      let responseElements = this.responseElements;

      displayElement.addEventListener("mousedown",
        function(e){
          if(!trial.displayedStimulus | trial.answered)
            return;

          let handleEndDotPosition = getHandleEndDotPosition();

          // Loop in order of increasing priority
          for (let priority in responseElements){
            for(let element of responseElements[priority]){
              // Stop if one element did react
              if(tryHandleClick(element, handleEndDotPosition, trial))
                return;
            }
          }
        }
      )
    }

    // PROBABLY GET TRIAL DATA HERE INSTEAD OF AS ARGUMENT?
    finishTrial(trial, trialData, timeout){
      //this.saveCardboardDetails(trialData);

      clearTimeout(trial.endTimeout);
      trial.endTimeout = undefined;

      document.body.onmousemove = null;
      this.responseElements = [];

      if (trial.numberType == Fraction.ID)
        this.flagFractionError(trialData);

      // TODO FIX THIS...
      setTimeout(function(){jsPsych.finishTrial(trialData)}, timeout + (trial.isTraining ? 2*1000 : 0));
    }

    flagFractionError(trial){
      trial.errorFlags = [];

      // DON'T COUNT THIS AS ERROR IN ANY CASE? OR USE THRESHOLD?
      if(trial.correct)
        return

      let fraction = new Fraction(trial.numberFirstPart, trial.numberSecondPart);


      for (let inverted of [true, false]){
        for (let ten_value of [10, 1, 5, 9]) {
          if (MathUtils.isEqualWithMargin(trial.roundedResponse, fraction.decimalError(inverted, ten_value), EPSILON)){
            this.addFlag(trial, ErrorFlags.DECIMAL)
          }
        }
      }

      if(MathUtils.isEqualWithMargin(trial.roundedResponse, 1 / fraction.value, EPSILON))
        this.addFlag(trial, ErrorFlags.INVERTED);

      if (fraction.denominator == 2 && MathUtils.isEqualWithMargin(trial.roundedResponse, fraction.numerator + 0.5, EPSILON))
        this.addFlag(trial, ErrorFlags.MIXED)

      if (fraction.numerator == 2 && MathUtils.isEqualWithMargin(trial.roundedResponse, fraction.denominator + 0.5, EPSILON))
        this.addFlag(trial, ErrorFlags.MIXED)

      for (let graduation of [0.1, 1]){
        if (MathUtils.isEqualWithMargin(trial.roundedResponse, fraction.numerator * graduation, EPSILON))
          this.addFlag(trial, ErrorFlags.COUNT);
      }

      let relativeResponse = trial.rangeMinimum + (trial.rangeMaximum - trial.rangeMinimum)  * fraction.value;
      if (MathUtils.isEqualWithMargin(trial.roundedResponse, relativeResponse, EPSILON))
        this.addFlag(trial, ErrorFlags.RELATIVE);
    }

    addFlag(trial, flag){
      if (!trial.errorFlags.some(f => f == flag))
        trial.errorFlags.push(flag);
    }
  }

  NumberToLinePlugin.info = info;

  return NumberToLinePlugin;
})(jsPsychModule);
