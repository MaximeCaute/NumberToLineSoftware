class ExperimentCore {
  static VISUAL_MODALITY = "visual";
  static VERBAL_MODALITY = "verbal";
  // TODO

  constructor(jsPsych, config, localizer, queryDict){
    // TODO CHECK JSPSYCH?
    if (typeof(localizer.getMessage) != typeof(Function))
      throw new Error(`Invalid localizer: ${localizer} ! Type: ${typeof(localizer)}.`);

    this.jsPsych = jsPsych;
    this.localizer = localizer;

    // ExperimentCore.formatConfig(config, queryDict)
    // No fraction audio supported in this version
    ExperimentCore.initializeAudioUtils([], false)

    this.config = config;
  }

  // TODO UNUSED
  static initializeAudioUtils(rationals, includeFractionsAudio){
    audioUtils.initializePositiveStreak(2,4);
    audioUtils.initializeNegativeStreak(1,1);

    if (!includeFractionsAudio)
      return

    // Initialize verbal stimuli
    let targetsNames = []

    for (let target of rationals){
      if (AUDIO_VOICES == []){
        targetsNames.push(`${FRACTION_AUDIO_PATH}${target.toImageName()}_FR.wav`);
      } else {
        for (let voice of AUDIO_VOICES){
          targetsNames.push(`${FRACTION_AUDIO_PATH}${target.toImageName()}_FR_${voice}.wav`);
        }
      }
    }

    audioUtils.initializeAudioDict(targetsNames);
  }

  // unclear whether this should be here, but meh for now
  static createInstructionsTrial(pages, nextButtonLabel, previousButtonLabel = null, data = {}, audio = null){

    if(!Array.isArray(pages) && typeof(pages) != typeof(Function))
        pages = [pages];

    let usePreviousButton = pages.length > 1;
    if (usePreviousButton && previousButtonLabel == null)
      throw new Error("Please provide a label for previous button.");

    return {
      type: jsPsychInstructions,
      pages: pages,
      show_clickable_nav: true,
      button_label_next: nextButtonLabel,
      button_label_previous: previousButtonLabel,
      on_load: function(){
        // Let the content go back to normal
        document.getElementById("jspsych-content").style = ""
        document.body.style.cursor = "auto";

        if (!usePreviousButton){
          let previousButton = document.getElementById("jspsych-instructions-back");
          previousButton.parentNode.removeChild(previousButton);
        }

        if (audio != null)
          audio.play()

        audioUtils.resetStreak();
      },
      data: data,
    }
  }

  static createAdaptiveFeedbackTrial(jsPsych, memorySpan, triggerThreshold){
    function getTrialsToAnalyze(jsPsych, memorySpan){
      return jsPsych.data.get().trials
              .filter(t => t.trial_type == "numberToLine")
              .filter(t => t.numberType == Fraction.ID)
              .slice(-memorySpan)
    }

    function testTrials(trials, threshold, error){
      return trials.map(t => t.errorFlags).filter(fs => fs.some(f => f == error)).length >= threshold
    }

    let errorToFile = (error) => `./res/videos/feedback/${error}_feedback.mp4`;
    let progressBar;

    let feedback = {
      type: jsPsychVideoKeyboardResponse,
      stimulus: function(){
        var trialsToAnalyze = getTrialsToAnalyze(jsPsych, memorySpan);

        for (let error in ErrorFlags){
          if (testTrials(trialsToAnalyze, triggerThreshold, error))
            return [errorToFile(error)];
        }
      },
      on_load: function(){
        progressBar = document.getElementById("jspsych-progressbar-container");

        if (progressBar != undefined)
          document.body.removeChild(progressBar);
      },

      on_finish: function(){
        //document.body.prepend(progressBar);
      },
      choices: "NO_KEYS",
      trial_ends_after_video: true,
      // Great solution to get the fullscreen here: https://github.com/jspsych/jsPsych/issues/3216
      css_classes: ["fullscreen-video"]
    };

    return {
      timeline: [feedback],
      conditional_function: () => {
        if (triggerThreshold <= 0)
          return false;
        // if(jsPsych.data.get().last(1).correct)
        //   return false;

        // Dirty hack
        if (jsPsych.data.get().last(1).trials[0].numberType != "FRACTION")
          return false

        // If we already showed a video before, don't do it again before the memory buffer is fresh!
        if (jsPsych.data.get().last(memorySpan).trials.filter(t => t.trial_type == "video-keyboard-response").length > 0)
          return false

        for (let error in ErrorFlags){
          // Small hack : test if the last answer was this kind of error
          if (!testTrials(getTrialsToAnalyze(jsPsych, 1), 1, error))
            continue

          if (testTrials(getTrialsToAnalyze(jsPsych, memorySpan), triggerThreshold, error)){
              console.log("Identified repeated error: " + error)
              return true
          }
        }

        return false
      },
    }
  }

  // This function makes sure that data has a correct format, and converts multiformat data to a single one.
  static formatTrialsData(trialData){
    let formattedData = JSON.parse(JSON.stringify(trialData));

    let target = Rational.parse(formattedData.targetString)
    formattedData.numberType = target.id;
    // TODO these two lines are deprecated
    formattedData.numberFirstPart = target.components[0];
    formattedData.numberSecondPart = target.components.length > 1 ? target.components[1] : -1;
    formattedData.numberComponents = target.components

    // Handle graduations
    if (!Array.isArray(trialData.graduationsPerUnit))
      formattedData.graduationsPerUnit = [trialData.graduationsPerUnit];
    formattedData.minorInterval = formattedData.graduationsPerUnit.map(d => 1/d);

    // Whatever will be saved!
    formattedData.flags = {
      targetString: trialData.targetString,
      graduationsPerUnit: trialData.graduationsPerUnit,
      flags: trialData.flags
    }

    return formattedData;
  }

  static getProportionCorrect(trials, defaultValue = 1){return trials.length == 0 ? defaultValue : trials.filter(t => t.correct).length / trials.length;}

  generateTrialsProcedure(trials, shuffle, repetitions, config, isTraining){
    let mainTrial = {
      type: numberToLine,
      numberType: this.jsPsych.timelineVariable("numberType"),
      numberFirstPart: this.jsPsych.timelineVariable("numberFirstPart"),
      numberSecondPart: this.jsPsych.timelineVariable("numberSecondPart"),
      numberComponents: this.jsPsych.timelineVariable("numberComponents"),
      majorGraduationInterval: this.jsPsych.timelineVariable("mainInterval"),
      minorGraduationInterval: this.jsPsych.timelineVariable("minorInterval"),
      useFeedback: isTraining ? config.feedback.correction.training : config.feedback.correction.test,
      timeLimit: isTraining ? config.trialMaxDuration.training : config.trialMaxDuration.test,
      // Keep that on a trial-by-trial basis to save data size
      extensions:  config.trackMouse ? [
        {type: jsPsychExtensionMouseTracking}
      ] : [],
      data: this.jsPsych.timelineVariable("flags"),
    };

    let adaptiveFeedbackTrial = ExperimentCore.createAdaptiveFeedbackTrial(
      this.jsPsych, config.adaptiveFeedback.memorySpan,
      config.adaptiveFeedback.threshold)


    return {
      timeline: [mainTrial, adaptiveFeedbackTrial],
      timeline_variables: trials.map(t => ExperimentCore.formatTrialsData(t)),
      randomize_order: shuffle,
      repetitions: repetitions,
    }
  }

  generateBlock(blockData, config){
    let timeline = [];

    if (blockData.trainingTrials.length > 0){
      timeline.push(this.createBlockInstructions(blockData));

      timeline.push(this.generateTrialsProcedure(
        blockData.trainingTrials,
        blockData.shuffleTraining,
        blockData.trainingTrialsRepetitions,
        config, true));

      timeline.push(this.createTrainingFinishedTrial(config.feedback.correction.test));
    }


    timeline.push(this.generateTrialsProcedure(
      blockData.testTrials,
      blockData.shuffleTest,
      blockData.testTrialsRepetitions,
      config, false));

    timeline.push(this.createBlockEndMessageTrial());

    return {
      timeline: timeline,
      domainType: LineRenderer.ID,
      rangeMinimum: blockData.min,
      rangeMaximum: blockData.max,
      modality: blockData.modality,
      outOfLineSmallerResponsePanelText: this.localizer.getMessage("SMALLER"),
      outOfLineGreaterResponsePanelText: this.localizer.getMessage("GREATER"),

      useIntermediateTicks: config.varyGraduationsSize,
      startOption: config.startOption,
      useVerticalSnap: config.snap.vertical,
      useHorizontalSnap: config.snap.horizontal,

      loop_function: function(data){
        // For retro compatibility of config files
        if (blockData.loopBelowSuccessThreshold == null){
          console.warn("Parameter `loopBelowSuccessThreshold` is not indicated in block configuration. This has been deprecated as of v1.2")
          return false
        }

        // TODO Add a parameter with 'IsTraining' to only count test trials. Kept here to have consistent data type.
        let successScore = ExperimentCore.getProportionCorrect(data.trials.filter(t => t.trial_type == "numberToLine"))

        console.log(`% correct on block: ${Math.round(successScore * 100)}%`);
        return blockData.loopBelowSuccessThreshold && successScore < blockData.successThreshold
      }
    };
  }

  // TODO PERHAPS NOT GREAT...
  generateTimeline(){

    let images = this.config.blocks
      .filter(b => b.modality == ExperimentCore.VISUAL_MODALITY)
      .map(b => b.trainingTrials.concat(b.testTrials))
      .flat()
      .map(t => t.targetString)
      // TODO harmonize that with rationals...
      .map(s => `./res/fractions/${s.replaceAll("/", "_over_").replaceAll("+", "_plus_")}_150x150.png`)

    let preload = {
      type: jsPsychPreload,
      images: [...new Set(images)],
      continue_after_error: true,
      on_finish: function(){console.log("Loaded images successfully!", [...new Set(images)])}
    }

    let timeline = [preload];
    // let timeline = []
    // TODO Instructions not in exp file

    let blocksTimeline = []
    for (let blockData of this.config.blocks){
      blocksTimeline.push(this.generateBlock(blockData, this.config))
    }

    if (this.config.shuffleBlocks)
      blocksTimeline = this.jsPsych.randomization.repeat(blocksTimeline, 1);

    timeline = timeline.concat(blocksTimeline);

    timeline.push(this.createGlobalFeedbackTrial());

    return timeline;
  }

  createBlockInstructions(block){
    return ExperimentCore.createInstructionsTrial([
        this.localizer.getMessage([
          "NEW_LINE",
          block.modality == ExperimentCore.VISUAL_MODALITY ? "VISUAL_MODALITY_DISPLAY" : "AUDITORY_MODALITY_DISPLAY"
        ], [block.min, block.max], "p") +
        this.localizer.getMessage("TRAINING_START", [], "p")
      ], this.localizer.getMessage("NEXT"), undefined);
  }

  // target rational should be a rational object
  // @deprecated
  createTestTrialFromRational(blockData, targetRational, congruency = null, isTraining = false){
    switch (targetRational.id){
      // TODO target ID should be unique...
      case Fraction.ID:
        if (congruency == null)
          return this.createTestTrial(blockData, targetRational.numerator, targetRational.denominator, targetRational.value, targetRational.id, isTraining);

        // "This" is not great..
        let graduationChoicesWithCongruence = this.config.graduations.fractionByDenominator[String(targetRational.denominator)]
        let graduationChoices = (congruency ?
            graduationChoicesWithCongruence.congruent :
            graduationChoicesWithCongruence.incongruent)
          .map((d) => 1/d)
        // let graduationChoices = this.getGraduationChoices(target.denominator, congruency).map((d) => 1/d);
        // Note that you can not test this with == [] since array are always tested by reference.
        if (graduationChoices.length == 0)
          return null;

        return this.createTestTrial(blockData, targetRational.numerator, targetRational.denominator, targetRational.value, targetRational.id, isTraining, graduationChoices);
      case Decimal.ID:
        return this.createTestTrial(blockData, targetRational.wholePart, targetRational.decimalPart, targetRational.value, targetRational.id, isTraining, this.config.graduations.decimal.map(d => 1/d));
      case WholeNumber.ID:
        // TODO, NOT ALL WHOLE NUMBERS SHOULD HAVE DECIMAL GRADUATIONS?
        return this.createTestTrial(blockData, targetRational.value, -1, targetRational.value, targetRational.id, isTraining);
      case FractionAddition.ID:
        TODO

      default:
        throw new Error(`Invalid number type: ${targetRational.id} !`);
    }
  }

  // TODO ADEQUATE NAME?
  createTrainingFinishedTrial(feedbackOnTest = false){
    return ExperimentCore.createInstructionsTrial(
      [
        this.localizer.getMessage("TRAINING_FINISHED", [], "p") +
        (feedbackOnTest ? "" : this.localizer.getMessage("NO_CORRECTION", [], "p"))
      ], this.localizer.getMessage("START"), undefined);
  }

  createShortFeedbackTrial(numberOfTrialsSinceLastFeedback){
    let localizer = this.localizer;
    let jsPsych = this.jsPsych;
    let feedbackMessage = function(){
      let lastTrials = jsPsych.data.get().last(jsPsych.current_trial.data.numberOfTrialsSinceLastFeedback).values();

      let numberOfCorrectTrials = 0;
      for (let previousTrial of lastTrials){
        numberOfCorrectTrials += previousTrial.correct ? 1 : 0;
      }

      let proportionCorrect = numberOfCorrectTrials / lastTrials.length;
      if (proportionCorrect <= .20)
        return  [localizer.getMessage("ACCURACY_DESCRIPTION", [Math.round(proportionCorrect * 100)], "p")+
                localizer.getMessage("ENCOURAGEMENT_POOR", [], "p")];
      if (proportionCorrect <= .90)
        return  [localizer.getMessage("ACCURACY_DESCRIPTION", [Math.round(proportionCorrect * 100)], "p") +
                localizer.getMessage("ENCOURAGEMENT_GOOD", [], "p")];
      return  [localizer.getMessage("ACCURACY_DESCRIPTION", [Math.round(proportionCorrect * 100)], "p") +
                localizer.getMessage("CONGRATULATIONS", [], "p")];
    };

    let data = {
      numberOfTrialsSinceLastFeedback: numberOfTrialsSinceLastFeedback
    };

    return ExperimentCore.createInstructionsTrial(
      feedbackMessage,
      this.localizer.getMessage("NEXT"),
      undefined,
      data
    );
  }

  createBlockEndMessageTrial(){
    return ExperimentCore.createInstructionsTrial(
      [this.localizer.getMessage("BLOCK_ENDED", [], "p")],
      this.localizer.getMessage("NEXT"),
      null, {},
      audioUtils.fanfare);
  }

  //TODO THIS will probebaly be a plugin later
  createGlobalFeedbackTrial(){
    let core = this;
    let feedbackPagesFunction = function(){
      let trials = core.jsPsych.data.get().values().filter(t => t.trial_type == "numberToLine");
      let wholeNumberTrials = trials.filter(t => t.numberType == WholeNumber.ID || t.numberType == WholeOperation.ID);
      let decimalTrials = trials.filter(t => t.numberType == Decimal.ID);
      let fractionTrials = trials.filter(t => t.numberType == Fraction.ID || t.numberType == FractionAddition.ID || t.numberType == WholeAndFractionOperation.ID);

      let flagCount = []
      for (let flag in ErrorFlags){
        flagCount.push({flag: flag, n: fractionTrials.filter(t => t.errorFlags.some(f => f == flag)).length});
      }

      let max = flagCount.reduce((acc, e) => e.n > acc.n ? e : acc);


      // let getPercentsCorrect = (trials) => {return Math.round(trials.filter(t => t.correct).length / trials.length * 100);}
      // TODO factorize with other definitions of this function
      let getProportionCorrect = (trials) => {return trials.length == 0 ? 1 : trials.filter(t => t.correct).length / trials.length;}

      // let firstDescription = core.localizer.getMessage("ACCURACY_DESCRIPTION",
      //     [trials.filter(t => t.correct).length, trials.length], "p") +
      //   core.localizer.getMessage("WHOLE_NUMBER_SCORE_FEEDBACK",
      //     [getProportionCorrect(wholeNumberTrials)], "p") +
      //   // TODO OTHER NUMBERS
      //   decimalTrials.length > 0 ? core.localizer.getMessage("DECIMAL_SCORE_FEEDBACK",
      //     [getProportionCorrect(decimalTrials)], "p") : "" +
      //   core.localizer.getMessage("FRACTION_SCORE_FEEDBACK",
      //     [getProportionCorrect(fractionTrials)], "p")

      let scoreFunction = function(integerProportionCorrect, decimalProportionCorrect, fractionProportionCorrect){
        let maxScore = 10000;

        let baseScore = 3000;
        let maxIntegerScore = 1000;

        let integerScore = Math.round(maxIntegerScore * integerProportionCorrect);
        let scoreJitter = Math.round(Math.random() * 200 - 100);

        let scoreAfterIntegers = baseScore + integerScore + scoreJitter;
        let fractionScore = Math.round((maxScore - scoreAfterIntegers) * fractionProportionCorrect);


        console.log(baseScore, integerScore, fractionScore, fractionProportionCorrect)

        return scoreAfterIntegers + fractionScore;
      }

      let scoreMessage = core.localizer.getMessage("POINTS_SCORE_FEEDBACK", [
        scoreFunction(getProportionCorrect(wholeNumberTrials), 0, getProportionCorrect(fractionTrials)),
        scoreFunction(1, 1, 1)
      ], "p");

      return [scoreMessage + core.localizer.getMessage("THANK_YOU", [], "p")];
      // // TODO as trial parameter
      // if (max.n < FEEDBACK_ERROR_THRESHOLD)
      //   return [firstDescription + core.localizer.getMessage("THANK_YOU", [], "p")];
      //
      // return [
      //   // TODO SOMETHING LIKE FEEDBACK.toHTMLPages
      //   firstDescription + core.localizer.getMessage("MORE_DETAILS_ON_ERRORS", [], "p"),
      //   "PLACEHOLDER_" + max.flag + "_" + max.n//localizer.getMessage("ERROR_DESCRIPTION_" + max.flag, [max.n], "p")
      // ];
    }

    return ExperimentCore.createInstructionsTrial(
      feedbackPagesFunction,
      this.localizer.getMessage("NEXT"),
      this.localizer.getMessage("PREVIOUS")
    );
  }
}
