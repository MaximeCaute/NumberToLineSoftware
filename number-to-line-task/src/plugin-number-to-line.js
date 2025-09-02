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
      useFeedback: {
        type: jspsych.ParameterType.BOOL,
        default: false,
      },
      // TODO in final version this ought to be an array
      // kept for backwards compatibility
      numberFirstPart: {
        type: jspsych.ParameterType.INT,
        default: -1,
      },
      numberSecondPart: {
        type: jspsych.ParameterType.INT,
        default: -1,
      },
      numberComponents: {
        type: jspsych.ParameterType.INT,
        default: [],
        array: true
      },
      minorGraduationInterval: {
        type: jspsych.ParameterType.FLOAT,
        default: 0.1,
      },
      modality: {
        type: jspsych.ParameterType.STRING,
        default: ExperimentCore.VISUAL_MODALITY,
      },
      timeLimit:{
        type: jspsych.ParameterType.INT,
        default: -1,
      },
      startOption:{
        type:jspsych.ParameterType.STRING,
        default: StartOptions.BUTTON,
      },

      // DETAILS
      // TICKS
      majorGraduationInterval: {
        type: jspsych.ParameterType.FLOAT,
        default: 1,
      },
      /*If true, unit intervals will be divided according to prime factor decomposition*/
      useIntermediateTicks: {
        type: jspsych.ParameterType.BOOL,
        default: true,
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
        default: true,
      },
      useHorizontalSnap:{
        type:jspsych.ParameterType.BOOL,
        default: true,
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
    }

    static Checks = class {
      // TODO BETTER NAME
      static testArgumentsValidity(trial){
        if (Array.isArray(trial.minorGraduationInterval)){
          if (trial.minorGraduationInterval.length == 0)
          {
            console.log(trial);
            throw new Error("minorGraduationInterval parameter cannot be empty list!");
          }
        } else {
          trial.minorGraduationInterval = [trial.minorGraduationInterval]
        }

        if (trial.numberFirstPart == -1 && trial.numberComponents.length == 0)
          throw new Error("numberFirstPart parameter can not be -1 when numberComponents is empty!")
      }

      static assertArgumentDefined(arg, argumentName = ""){
        // You can't get the name of an undefined var.
        if (arg == undefined)
          throw new TypeError(`The argument ${argumentName} is undefined. ` +
            `This usually means it should have been set on trial start. `)
      }

      // This functions makes sure that previous generations of trial are still working.
      static enforceArgumentsRetrocompatibility(trial){
        // Trial components from first and second parts (as you can now have more than 2)
        if (trial.numberComponents.length == 0)
          trial.numberComponents = [trial.numberFirstPart, trial.numberSecondPart]

        // For data structure, add first and second part back
        trial.numberFirstPart = trial.numberComponents[0]
        trial.numberSecondPart = trial.numberComponents.length >= 2 ? trial.numberComponents[1] : -1
      }
    }

    static Maths = class {
      static createTarget(type, components){
        switch (type){
          case Fraction.ID:
            return new Fraction(components[0], components[1]);
          case Decimal.ID:
            return new Decimal(components[0], components[1]);
          case WholeNumber.ID:
            return new WholeNumber(components[0]);
          case FractionAddition.ID:
            return new FractionAddition(components[0], components[1], components[2], components[3])
          case WholeOperation.ID:
            return new WholeOperation(components)
          case WholeAndFractionOperation.ID:
            return new WholeAndFractionOperation(components)
          default:
            throw new Error(`Invalid type: {type}!`)
        }
      }

      static generateNumberLinesData(trial){
        let numberLines = [];
        // TODO adapt the name, trial.minorGraduationInterval is the possible gradautions
        for (var minorGraduationInterval of trial.minorGraduationInterval){

          let primeFactorsOfDenominator = MathUtils.getPrimeFactors(Math.round(1/minorGraduationInterval));
          let intermediateGraduationInterval = primeFactorsOfDenominator.length == 1 ? 0 : 1/Math.min(...primeFactorsOfDenominator);

          let line = NumberLine.createLinearLine(trial.rangeMinimum, trial.rangeMaximum,
            trial.majorGraduationInterval, intermediateGraduationInterval, minorGraduationInterval, trial.useIntermediateTicks);

          numberLines.push(line);
        }

        return numberLines;
      }

      static getMatchingGraduationValue(value, trial){
        // TODO FIND THE CORRECT LINE INSTEAD OF THE FIRST
        return trial.info.numberLines[0].getClosestTickValue(value);
      }

      static computeCorrectAnswer(trial){
        NumberToLinePlugin.Checks.assertArgumentDefined(trial.targetValue, "trial.targetValue");

        // TODO CHECK FOR ROUNDING ERRORS
        if (trial.rangeMinimum > trial.targetValue)
          return SMALLER_PANEL_ID;
        if (trial.rangeMaximum < trial.targetValue)
          return GREATER_PANEL_ID;

        return NumberToLinePlugin.Maths.getMatchingGraduationValue(trial.targetValue, trial);
      }

      /** Compares the actual answer to the correct answer **/
      static isCorrect(actualAnswer, correctAnswer, epsilon){
        if (typeof(actualAnswer) != typeof(correctAnswer))
          return false;

        // If we have an actual value on the line.
        if (typeof(actualAnswer) == typeof(0)){
          return MathUtils.isEqualWithMargin(actualAnswer, correctAnswer, epsilon);
        // If we have an out-of-line response
        } else {
          return actualAnswer == correctAnswer;
        }
      }

      static computeCorrectGraduationChoice(trial){
        if([Fraction.ID, Decimal.ID].includes(trial.numberType)){
          for (let minorGraduationInterval of trial.minorGraduationInterval){

            let product = minorGraduationInterval *
              (trial.numberType == Fraction.ID ? trial.numberSecondPart : 10 );

            if ([product, 1/product].some(x => MathUtils.isIntegerWithMargin(x, EPSILON))){
              return minorGraduationInterval;
            }
          }
        }

        return null;
      }

      static addFlag(trial, flag){
        if (!trial.errorFlags.some(f => f == flag)){
          console.log("Adding error flag to trial:", flag)
          trial.errorFlags.push(flag);
        }
      }

      static flagFractionError(trial){
        trial.errorFlags = [];

        let epsilon = 0.51 * trial.minorGraduationInterval;

        // DON'T COUNT THIS AS ERROR IN ANY CASE? OR USE THRESHOLD?
        if(trial.correct)
          return

        let fraction = new Fraction(trial.numberFirstPart, trial.numberSecondPart);


        for (let inverted of [true, false]){
          let numerator = inverted ? fraction.denominator : fraction.numerator;
          let denominator = inverted ? fraction.numerator : fraction.denominator;

          let pureDecimalResult = numerator + denominator * trial.minorGraduationInterval;

          let possibleDecimalResults = [pureDecimalResult]

          if (MathUtils.isIntegerWithMargin(pureDecimalResult, epsilon)){
            possibleDecimalResults.push(numerator + 1 * trial.minorGraduationInterval);
            possibleDecimalResults.push(numerator + denominator/2 * trial.minorGraduationInterval);
            possibleDecimalResults.push(numerator + (denominator - 1) * trial.minorGraduationInterval);
          }

          for (let result of possibleDecimalResults) {
            if (MathUtils.isEqualWithMargin(trial.roundedResponse, result, epsilon)){
              NumberToLinePlugin.Maths.addFlag(trial, ErrorFlags.DECIMAL)
            }
          }
        }

        // TODO Update with Jérôme
        if(MathUtils.isEqualWithMargin(trial.roundedResponse, 1 / fraction.value, EPSILON))
          NumberToLinePlugin.Maths.addFlag(trial, ErrorFlags.INVERTED);

        if (fraction.denominator == 2 && MathUtils.isEqualWithMargin(trial.roundedResponse, fraction.numerator + 0.5, EPSILON))
          NumberToLinePlugin.Maths.addFlag(trial, ErrorFlags.MIXED)

        if (fraction.numerator == 2 && MathUtils.isEqualWithMargin(trial.roundedResponse, fraction.denominator + 0.5, EPSILON))
          NumberToLinePlugin.Maths.addFlag(trial, ErrorFlags.MIXED)

        for (let graduation of [trial.minorGraduationInterval, 1]){
          if (MathUtils.isEqualWithMargin(trial.roundedResponse, fraction.numerator * graduation, epsilon))
            NumberToLinePlugin.Maths.addFlag(trial, ErrorFlags.COUNT);
        }

        let relativeResponse = trial.rangeMinimum + (trial.rangeMaximum - trial.rangeMinimum)  * fraction.value;
        if (MathUtils.isEqualWithMargin(trial.roundedResponse, relativeResponse, EPSILON))
          NumberToLinePlugin.Maths.addFlag(trial, ErrorFlags.RELATIVE);
      }
    }

    static UI = class {
      static createRenderer(type, barColor, unitBackgroundColors){
        switch (type){
          case LineRenderer.ID:
            return new LineRenderer(barColor);
          case BarRenderer.ID:
            return new BarRenderer(barColor, unitBackgroundColors);
        }
      }

      static computeStimulusDisplayFunction(target, trial){
        let pathName;
        switch(trial.modality){
          case ExperimentCore.VISUAL_MODALITY:
            pathName = target.toImageNameWithDimensions(
              trial.imageFileDimension, trial.imageFileDimension, FRACTION_IMAGE_PATH);
            return function(panel){
              // This is necessary to handle the rest
              trial.displayedStimulus = true;
              panel.innerHTML = `<img src="${pathName}" alt="fraction">`;
            };
          case ExperimentCore.VERBAL_MODALITY:
          // TODO FACTORIZE
            let audioSpecification = trial.audioVoice == undefined ? "" : `_${trial.audioVoice}`;

            pathName = FRACTION_AUDIO_PATH + `${target.toImageName()}_FR${audioSpecification}.wav`;
            return function(panel){
              trial.displayedStimulus = true;
              audioUtils.playFile(pathName);
            };
          default:
            throw new Error(`Illegal modality: ${trial.modality}!`);
        }
      }

      static Listeners = class {
        static wasClicked(responseElement, clickCoordinates){
          let responsePanelBoundingRect = responseElement.getBoundingClientRect();

          return MathUtils.isInRect(clickCoordinates, responsePanelBoundingRect);
        }

        static createMouseClickedListener(trial, jsPsych){
          // Although `addEventListener` does not seem to care, we make the function async for convenience.
          return async function(e){
            if(!trial.displayedStimulus | trial.answered)
              return;

            // Save position asap to avoid movement issues
            let currentAnswerCoordinates = Cardboard.getCurrentCoordinates();

            // Loop in order of increasing priority
            for (let priority in trial.info.responseElements){
              for(let element of trial.info.responseElements[priority]){
                // Ignore invisible elements
                if(element.style.visibility == "hidden")
                  continue

                // Stop if one element did react
                if(NumberToLinePlugin.UI.Listeners.wasClicked(element, currentAnswerCoordinates)){
                  await NumberToLinePlugin.Closing.handleResponseAndClose(
                    element, currentAnswerCoordinates, trial, jsPsych)
                  return;
                }
              }
            }
          }
        }

        static registerResponseElement(element, priority, trial){
          NumberToLinePlugin.Checks.assertArgumentDefined(trial.info.responseElements, "trial.info.responseElements")

          if(trial.info.responseElements[priority] == undefined) {
            trial.info.responseElements[priority] = [element];
          } else {
            trial.info.responseElements[priority].push(element);
          }
        }
      }

      static HTML = class {
        // TODO doc
        // The context div holds (Everything??)
        static createContextDiv(displayElement){
          let trialContextDiv = document.createElement("div");
          trialContextDiv.id = "trial-context";
          displayElement.append(trialContextDiv);
          document.body.style.cursor = "auto"

          trialContextDiv.style.height = "100vh";
          trialContextDiv.style.width = "100vw";
          trialContextDiv.style.backgroundColor = GUI_CONFIG.BACKGROUND_COLOR;

          return trialContextDiv;
        }

        static createCardboardElement(trial, displayStimulus, alreadyClicked = false, displayImmediately = false){
          let cardboard = new Cardboard(GUI_CONFIG.CARDBOARD_BACKGROUND_COLOR,
            GUI_CONFIG.CARDBOARD_PANEL_SIZE, GUI_CONFIG.CARDBOARD_PANEL_SIZE,
            GUI_CONFIG.CARDBOARD_HANDLE_WIDTH, GUI_CONFIG.CARDBOARD_HANDLE_LENGTH,
            GUI_CONFIG.CARDBOARD_HANDLE_END_RADIUS,
            GUI_CONFIG.CARDBOARD_HANDLE_DOT_RADIUS, GUI_CONFIG.CARDBOARD_HANDLE_DOT_COLOR);

          // TODO rename to onCardboardInitialClick?
          let onCardboardClicked = function(cardboardElement){
            // This prevents multiple click on the handle end even though the cursor is gone
            if (trial.cardboardClickTimeFromStart == undefined){
              trial.cardboardClickTimeFromStart = Date.now() - trial.startTime;

              document.body.onmousemove = Cardboard.createCarboardMovementFunction(
                cardboardElement,
                document.getElementById(Renderer.RESPONSE_PANEL_ID).getBoundingClientRect(),
                document.getElementById(Renderer.PANEL_ID).getBoundingClientRect().bottom,
                cardboard.handleLength);
            }
          }

          trial.displayedStimulus = displayImmediately;

          let cardboardElement = cardboard.createAsDiv(displayStimulus, onCardboardClicked,
            document.getElementById(Renderer.RESPONSE_PANEL_ID),
            alreadyClicked,
            displayImmediately);

          cardboardElement.style.bottom = `calc(50vh
            - (${GUI_CONFIG.CARDBOARD_PANEL_CENTER_FROM_VIEWPORT_CENTER})
            - ${GUI_CONFIG.CARDBOARD_HANDLE_LENGTH}
            - ${GUI_CONFIG.CARDBOARD_PANEL_SIZE} / 2)`;
          return cardboardElement;
        }

        static createLineElementsForDocument(trial, target, displayElement){
          let renderer = NumberToLinePlugin.UI.createRenderer(trial.domainType, GUI_CONFIG.BAR_COLOR, GUI_CONFIG.UNIT_BACKGROUND_COLORS);

          NumberToLinePlugin.Checks.assertArgumentDefined(trial.info.numberLines, "trial.info.numberLines");

          let lineElements = [];
          //TODO adapt the name, trial.minorGraduationInterval is the possible gradautions
          for (var i in trial.info.numberLines){
            let mathematicalNumberLine = trial.info.numberLines[i];

            // TODO PROBABLY THIS COULD BE IMPROVED
            let lineElement = renderer.createAsElement(
                mathematicalNumberLine,
                GUI_CONFIG.BAR_TOP_FROM_VIEWPORT_CENTER,
                GUI_CONFIG.MAJOR_TICKS_HEIGHT, GUI_CONFIG.BAR_WIDTH, GUI_CONFIG.BAR_HEIGHT, GUI_CONFIG.BAR_COLOR,
                GUI_CONFIG.RESPONSE_MARGIN,
                function(){return trial.displayedStimulus});

            NumberToLinePlugin.UI.Listeners.registerResponseElement(lineElement, LINE_PRIORITY, trial)

            // TODO the design currently breaks if the id of the first line is not kep as such, as other elements will look for it.
            if (i != 0){
              // TODO make the 2 a constant
              // TODO it is not great to reuse trial info after the lines have been set...
              lineElement.id += "-" + trial.minorGraduationInterval[i].toFixed(2)
            }

            lineElement.style.visibility = i == 0 ? "visible" : "hidden"
            lineElements.push(lineElement)
          }

          return lineElements
        }

        static createOutOfLineResponsePanel(trial, isLeft, target, displayElement){
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

          NumberToLinePlugin.UI.Listeners.registerResponseElement(outOfLineResponsePanelDiv, OUT_OF_LINE_RESPONSE_PANELS_PRIORITY, trial)

          return outOfLineResponsePanelDiv;
        }

        static createCardboardPopupButton(displayElement, trial, displayStimulus){
          let button = document.createElement("button");

          button.style.height = GUI_CONFIG.POPUP_BUTTON_HEIGHT;
          button.style.width = GUI_CONFIG.POPUP_BUTTON_WIDTH;

          button.style.position = "absolute";
          button.style.transform = "translate(-50%, 50%)"
          button.style.left = "50%";
          button.style.bottom = `calc(50vh
            - (${GUI_CONFIG.CARDBOARD_PANEL_CENTER_FROM_VIEWPORT_CENTER})
          )`;

          button.onclick = function(){
            let cardboardElement = NumberToLinePlugin.UI.HTML.createCardboardElement(trial, displayStimulus, true);
            displayElement.appendChild(cardboardElement);
            displayElement.removeChild(button);
            NumberToLinePlugin.Saving.saveCardboardDetails(trial);
          }

          return button;
        }

        static createMultipleLineChoicesElement(lineElements, trial){
            let graduationChangeButtonsContainer = document.createElement("div");
            graduationChangeButtonsContainer.id = "graduation-change-buttons-container";
            graduationChangeButtonsContainer.style.display = "flex";
            graduationChangeButtonsContainer.style.flexDirection = "column";

            for (let i in lineElements){
              // Todo I should have a dictionary {interval: element} saved in trial.info
              let lineElement = lineElements[i];
              let graduationInterval = trial.minorGraduationInterval[i];

              let button = document.createElement("button");
              button.innerHTML = "1/" + Math.round(1/graduationInterval);
              // TODO trial params
              button.style.width = "60px";
              button.style.height = "40px";

              button.onclick = function(){
                for (let otherLineElement of lineElements){
                  otherLineElement.style.visibility = "hidden";
                }

                lineElement.style.visibility = "visible";
              }

              graduationChangeButtonsContainer.appendChild(button);
            }

          return graduationChangeButtonsContainer;
        }

        static initializeResponseElement(contextDiv, displayStimulus, trial){
          let startClickBoundingRect;

          if(trial.startOption == StartOptions.BUTTON){
            let cardboardPopupButton = NumberToLinePlugin.UI.HTML.createCardboardPopupButton(trialContextDiv, trial, displayStimulus);
            contextDiv.appendChild(cardboardPopupButton);

            startClickBoundingRect = cardboardPopupButton.getBoundingClientRect();
          } else {
            let cardboardElement = NumberToLinePlugin.UI.HTML.createCardboardElement(trial, displayStimulus, false, trial.startOption == StartOptions.OPEN_CARDBOARD);
            contextDiv.appendChild(cardboardElement);

            NumberToLinePlugin.Saving.saveCardboardDetails(trial);

            startClickBoundingRect = document
                    .getElementById(Cardboard.HANDLE_END_ID)
                    .getBoundingClientRect();
          }

          NumberToLinePlugin.Saving.saveGUIDetails(trial, startClickBoundingRect);
        }
      }

      static Feedback = class {
        // Indicates whether the response is correct or not, but does not give the correct response
        static giveIndicativeFeedback(isCorrect){
          let cardboard = document.getElementById(Cardboard.FULL_DIV_ID);
          audioUtils.playAudioFeedback(isCorrect, true);

          // Color the cardboard accordingly
          HTML_UTILS.ReplaceBackgroundColour(cardboard,
            document.getElementById(Cardboard.PANEL_ID).style.backgroundColor,
            isCorrect ? GUI_CONFIG.CARDBOARD_CORRECT_FEEDBACK_COLOUR : GUI_CONFIG.CARDBOARD_INCORRECT_FEEDBACK_COLOUR);
        }

        static highlightCorrectPosition(correctAnswer){
          let feedbackColour = GUI_CONFIG.LINE_FEEDBACK_COLOUR;
          //TODO, make the 2 not so magic a number
          let parsedFloatAnswer = parseFloat(correctAnswer)
          // We need to String(parseFloat(toFixed(2))) in order to remove unnecessary padding
          // TODO a simplification could be to have2-digit ids for graduations
          let correctAnswerID = isNaN(parsedFloatAnswer) ? correctAnswer : String(parseFloat(correctAnswer.toFixed(2)))
          console.log(`Fetching element associated with correct answer: ${correctAnswer}, ID: ${correctAnswerID}`)
          let feedbackElement = document.getElementById(correctAnswerID);

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
        }

        // giveCorrectiveFeedback(correctAnswer, isCorrectAnswer, feedbackColour){
        // Should not be called if correct
        static async giveCorrectiveFeedback(answer, trial){
          let correctAnswer = NumberToLinePlugin.Maths.computeCorrectAnswer(trial);
          let cardboard = document.getElementById(Cardboard.FULL_DIV_ID)

          // TODO trial.info.numberLines[0]
          let targetPosition = NumberToLinePlugin.UI.convertValueToXPosition(correctAnswer, trial.info.numberLines[0])

          // TODO this can probably be done with target position as the y coord
          let linePanelDivBoundingRect = document.getElementById(Renderer.PANEL_ID).getBoundingClientRect();

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

          // TODO, maybe the target can be saved in trial.info.
          let target = NumberToLinePlugin.Maths.createTarget(trial.numberType, trial.numberComponents);

          await JsUtils.sleep(trial.timeBeforeFeedback);
          if (trial.modality == ExperimentCore.VERBAL_MODALITY){
            let audioSpecification = trial.audioVoice == undefined ? "" : `_${trial.audioVoice}`;

            // NOTE, in this additional part pathname was not defined, contrary to above.
            let pathName = FRACTION_AUDIO_PATH + `${target.toImageName()}_FR${audioSpecification}.wav`;
            audioUtils.playFile(pathName);
          }

          let correctGraduation = NumberToLinePlugin.Maths.computeCorrectGraduationChoice(trial);

          let lineElements = [...document.getElementById(Renderer.RESPONSE_PANEL_ID).parentElement.children].filter(e => e.id.includes(Renderer.RESPONSE_PANEL_ID))
          let currentLine = lineElements.filter(e => e.style.visibility == "visible")[0];
          let currentLineIndex = lineElements.indexOf(currentLine);

          let correctLineIndex = correctGraduation == null ?
            currentLineIndex :
            trial.minorGraduationInterval.indexOf(correctGraduation);

          if (correctLineIndex == -1)
            throw new Exception();

          // Only run graphical updates if it actually changes anything
          if (currentLineIndex != correctLineIndex){
            // TODO ID
            let graduationChoiceButtons = [...document.getElementById("graduation-change-buttons-container").children];
            // TODO color
            graduationChoiceButtons[correctLineIndex].style.backgroundColor = "green";
            await JsUtils.sleep(trial.timeBeforeFeedback/4);
            graduationChoiceButtons[correctLineIndex].style.backgroundColor = "lightgreen";
            await JsUtils.sleep(trial.timeBeforeFeedback/4);
            graduationChoiceButtons[correctLineIndex].style.backgroundColor = "green";
            await JsUtils.sleep(trial.timeBeforeFeedback/4);
            graduationChoiceButtons[correctLineIndex].style.backgroundColor = "lightgreen";
            await JsUtils.sleep(trial.timeBeforeFeedback/4);
            graduationChoiceButtons[correctLineIndex].style.backgroundColor = "green";

            await JsUtils.sleep(trial.timeBeforeFeedback)
            lineElements[currentLineIndex].style.visibility = "hidden";
            lineElements[correctLineIndex].style.visibility = "visible";
            await JsUtils.sleep(trial.timeBeforeFeedback)
          }

          cardboard.style.bottom = `calc(100vh - ${linePanelDivBoundingRect.bottom}px -
             ${document.getElementById(Cardboard.HANDLE_END_ID).getBoundingClientRect().height / 2}px`
          cardboard.style.scale = 0;
          cardboard.style.left = `${targetPosition}px`;
          HTML_UTILS.ReplaceBackgroundColour(cardboard, "red", "green");

          cardboardDuplicateAnimation.play();
          cardboardAnimation.play();
          await cardboardAnimation.finished;
        }

        static async handleFeedback(answer, trial){
          if (trial.useFeedback){
            let correctAnswer = NumberToLinePlugin.Maths.computeCorrectAnswer(trial);
            let isCorrectAnswer = answer == correctAnswer;
            NumberToLinePlugin.UI.Feedback.giveIndicativeFeedback(isCorrectAnswer);

            if (!isCorrectAnswer){
              NumberToLinePlugin.UI.Feedback.highlightCorrectPosition(correctAnswer);
              await NumberToLinePlugin.UI.Feedback.giveCorrectiveFeedback(answer, trial);
            }
          } else {
            HTML_UTILS.ReplaceBackgroundColour(document.getElementById(Cardboard.FULL_DIV_ID), GUI_CONFIG.CARDBOARD_BACKGROUND_COLOR, GUI_CONFIG.CARDBOARD_FROZEN_BACKGROUND_COLOR);
          }
        }
      }

      static handleSnap(trial, roundedAnswer){
        let cardboard = document.getElementById(Cardboard.FULL_DIV_ID);

        // This only handles snap on response, not before
        if (trial.useVerticalSnap)
          NumberToLinePlugin.UI.snapVertically(cardboard);
        if (trial.useHorizontalSnap)
          // TODO current line
          NumberToLinePlugin.UI.snapHorizontally(cardboard, trial.info.numberLines[0], roundedAnswer);
      }

      static snapVertically(cardboardDiv){
        let lineResponsePanelDiv = document.getElementById(Renderer.RESPONSE_PANEL_ID);
        cardboardDiv.style.top = `${
            lineResponsePanelDiv.getBoundingClientRect().bottom
            - cardboardDiv.getBoundingClientRect().height}px`;
      }

      static snapHorizontally(cardboardDiv, line, roundedAnswer){
        // This does not do anything if answer is not a number (e.g. a string for out of line response panels)
        if (typeof(roundedAnswer) == typeof(0)){
          cardboardDiv.style.left = `${NumberToLinePlugin.UI.convertValueToXPosition(roundedAnswer, line)}px`;
        }
      }

      static convertValueToXPosition(value, line){
        let linePanelDivBoundingRect = document.getElementById(Renderer.PANEL_ID).getBoundingClientRect();

        switch (value){
          case SMALLER_PANEL_ID:
            return linePanelDivBoundingRect.left
              - document.getElementById(SMALLER_PANEL_ID).getBoundingClientRect().width / 2;
          case GREATER_PANEL_ID:
            return linePanelDivBoundingRect.right
              + document.getElementById(SMALLER_PANEL_ID).getBoundingClientRect().width / 2
          default:
            let targetRelativeX = (value - line.min) / line.range();
            return linePanelDivBoundingRect.left + targetRelativeX * linePanelDivBoundingRect.width
        }
      }
    }

    static Saving = class {
      // answer should be {raw, rounded}
      static saveTrialAnswer(answer, answerTime, trial){
        NumberToLinePlugin.Checks.assertArgumentDefined(trial.startTime, "trial.startTime");
        NumberToLinePlugin.Checks.assertArgumentDefined(trial.cardboardClickTimeFromStart, "trial.cardboardClickTimeFromStart");
        NumberToLinePlugin.Checks.assertArgumentDefined(trial.targetValue, "trial.targetValue");

        trial.rtFromStart = answerTime - trial.startTime;
        trial.answered = true;
        trial.rt = trial.rtFromStart - trial.cardboardClickTimeFromStart;
        trial.rawResponse = answer.raw;
        trial.roundedResponse = answer.rounded;
        trial.correctAnswerOnCurrentLine = NumberToLinePlugin.Maths.computeCorrectAnswer(trial);

        // TODO
        let currentLineIndex = 0;

        // TODO FIX THE USE OF EPSILON HERE
        trial.correct = NumberToLinePlugin.Maths.isCorrect(answer.rounded, trial.correctAnswerOnCurrentLine, EPSILON);
      }

      // TODO investigate why this is called twice
      static saveCardboardDetails(trial){
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

      static saveGUIDetails(trial, startClickBoundingRect){
        trial.startClickX = startClickBoundingRect.left + startClickBoundingRect.width / 2;
        trial.startClickY = startClickBoundingRect.top + startClickBoundingRect.height / 2;

        // TODO we frequently use `document.getElementById(Renderer.PANEL_ID).getBoundingClientRect()` which could be a method of its own
        let lineBoundingRect = document.getElementById(Renderer.PANEL_ID).getBoundingClientRect();

        trial.lineLeftBoundaryX = lineBoundingRect.left;
        trial.lineRightBoundaryX = lineBoundingRect.right;
        trial.lineTop = lineBoundingRect.top;
        trial.lineBottom = lineBoundingRect.bottom;
        // TODO There was an error here in the first experiment using width and not height !
        // We still save it but this could be better with line top and bottom above.

        trial.lineY = lineBoundingRect.top + lineBoundingRect.height / 2;
      }

    }

    static Closing = class {
      // PROBABLY GET TRIAL DATA HERE INSTEAD OF AS ARGUMENT?
      static async finishTrial(jsPsych, trial, trialData, timeout){
        //this.saveCardboardDetails(trialData);

        // TODO trial.info.endTimeout
        clearTimeout(trial.endTimeout);
        trial.endTimeout = undefined;

        // Drop any info stored temporarily
        trial.info = undefined;

        // Remove mouse movement listeners in any case to have a clean trial next
        document.body.onmousemove = null;

        trial.errorFlags = []
        trialData.errorFlags = []
        if (trial.numberType == Fraction.ID)
          NumberToLinePlugin.Maths.flagFractionError(trialData);

        // TODO FIX THIS...
        await JsUtils.sleep(timeout);
        jsPsych.finishTrial(trialData);
      }

      static async setTimeLimit(trial, jsPsych){
        if (trial.timeLimit <= 0)
          return

        // TODO, jspsych.plugin.api could be a good call
        trial.endTimeout = setTimeout(function(){
          let trialData = jsonUtils.copyTrial(trial);
          trialData.correct = false;
          trialData.answered = false;

          NumberToLinePlugin.Closing.finishTrial(jsPsych, trial, trialData, 0)
        }, trial.timeLimit);
      }

      static async handleResponseAndClose(responseElement, clickCoordinates, trial, jsPsych){
        // Remove cardboard movement listener to allow proper display of the response
        document.body.onmousemove = null;

        let currentTime = Date.now();
        // TODO GET PRIORITY
        let actualAnswer = responseElement.computeRawAndRoundedAnswers(clickCoordinates, trial.responseMargin);

        NumberToLinePlugin.Saving.saveTrialAnswer(actualAnswer, currentTime, trial)

        NumberToLinePlugin.UI.handleSnap(trial, actualAnswer.rounded);
        await NumberToLinePlugin.UI.Feedback.handleFeedback(actualAnswer.rounded, trial);

        // TODO investigate the copyTrial
        NumberToLinePlugin.Closing.finishTrial(jsPsych, trial, jsonUtils.copyTrial(trial), trial.afterTrialDelay)

        return true;
      }
    }

    trial(displayElement, trial) {
      NumberToLinePlugin.Checks.testArgumentsValidity(trial);
      NumberToLinePlugin.Checks.enforceArgumentsRetrocompatibility(trial);

      // Clean the display stimulus
      displayElement.innerHTML = "";
      trial.displayedStimulus = false;

      // Create an object that will store all info about the trial that should be wiped at the end!
      // This is specifically meant for structures non-native to jspsych nor JS. (e.g., NumberLine objects)
      trial.info = {};
      trial.info.responseElements = {};

      // We add another layer that will contain event listeners and be refreshed every trial
      let trialContextDiv = NumberToLinePlugin.UI.HTML.createContextDiv(displayElement)

      let target = NumberToLinePlugin.Maths.createTarget(trial.numberType, trial.numberComponents);
      // TODO check whether this should go into trial.info.targetValue
      trial.targetValue = target.value

      trial.info.numberLines = NumberToLinePlugin.Maths.generateNumberLinesData(trial);
      // TODO I dislike the target being used here...
      let lineElements = NumberToLinePlugin.UI.HTML.createLineElementsForDocument(trial, target, displayElement);

      // The line element defines the position of the response panels, so it ought to be added before.
      for (let lineElement of lineElements){
        trialContextDiv.appendChild(lineElement);
      }

      // Add response panels
      trialContextDiv.insertBefore(NumberToLinePlugin.UI.HTML.createOutOfLineResponsePanel(trial, true, target, trialContextDiv), lineElements[0]);
      trialContextDiv.insertBefore(NumberToLinePlugin.UI.HTML.createOutOfLineResponsePanel(trial, false, target, trialContextDiv), lineElements[0]);

      let displayStimulus = NumberToLinePlugin.UI.computeStimulusDisplayFunction(target, trial);

      // Only add a line choice element if needed
      if (trial.minorGraduationInterval.length > 1){
        let lineChoiceElement = NumberToLinePlugin.UI.HTML.createMultipleLineChoicesElement(lineElements, trial);

        trialContextDiv.appendChild(lineChoiceElement);
      }

      NumberToLinePlugin.UI.HTML.initializeResponseElement(trialContextDiv, displayStimulus, trial);

      NumberToLinePlugin.Closing.setTimeLimit(trial, this.jsPsych);
      trial.startTime = Date.now();

      trialContextDiv.addEventListener(
        "mousedown",
        NumberToLinePlugin.UI.Listeners.createMouseClickedListener(trial, this.jsPsych)
      );
    }
  }

  NumberToLinePlugin.info = info;

  return NumberToLinePlugin;
})(jsPsychModule);
