class ExperimentCore {
  static VISUAL_MODALITY = "visual";
  static VERBAL_MODALITY = "verbal";
  // TODO

  constructor(localizer, targets, blocks, queryDict){
    // TODO CHECK JSPSYCH?
    if (typeof(localizer.getMessage) != typeof(Function))
      throw new Error(`Invalid localizer: ${localizer} ! Type: ${typeof(localizer)}.`);

    this.localizer = localizer;

    let voiceIndex = Math.floor(Math.random() * AUDIO_VOICES.length);

    this.voice = AUDIO_VOICES[voiceIndex];

    this.trainingTargets = targets.training.map(function(rationalString){ return Rational.parse(rationalString); });
    this.testTargets = targets.test.map(function(rationalString){ return Rational.parse(rationalString); });

    // Initialize verbal stimuli
    let targetsNames = []
    for (let target of this.testTargets.concat(this.trainingTargets)){
      if (AUDIO_VOICES == []){
        targetsNames.push(`${FRACTION_AUDIO_PATH}${target.toImageName()}_SG.wav`);
      } else {
        for (let voice of AUDIO_VOICES){
          targetsNames.push(`${FRACTION_AUDIO_PATH}${target.toImageName()}_SG_${voice}.wav`);
        }
      }
    }

    audioUtils.initializeAudioDict(targetsNames);
    audioUtils.initializePositiveStreak(2,4);
    audioUtils.initializeNegativeStreak(1,1);

    this.blocks = queryDict.line ?
     [{min: queryDict.lineMinimum, max: queryDict.lineMaximum, modality: queryDict.modality}] :
     jsPsych.randomization.shuffle(blocks);
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

  // TODO PERHAPS NOT GREAT...
  generateTimeline(){
    let timeline = [];

    for (let block of this.blocks){
      // Start a block with the instructions
      timeline.push(this.createBlockInstructions(block));

      // Add training (if not debugging)
      if (queryDict.training){
        for (let trainingTarget of this.trainingTargets){
          timeline.push(this.createTestTrialFromRational(block, trainingTarget, true));
        }
        timeline.push(this.createTrainingFinishedTrial());
      }

      let blockTrials = [];

      // Repeat the targets and give feedback at the end of each repetition ?
      for (let j = 0; j < NUMBER_OF_REPETITIONS; j++){
        blockTrials = blockTrials.concat(
          this.createSubBlock(block, this.testTargets,
            j == 0 ? function(target){return true;} : function(target){return target instanceof Fraction;},
            blockTrials.length > 0 ? blockTrials[blockTrials.length - 1] : null
          )
        );
      }

      timeline = timeline.concat(blockTrials);

      // NOTA : this was removed at T2
      //timeline.push(this.createShortFeedbackTrial(blockTrials.length));
      timeline.push(this.createBlockEndMessageTrial())
    }

    timeline.push(this.createGlobalFeedBackTrial());

    console.log(timeline.filter(t => t.type == numberToLine).map(
      t => [t.numberType, t.numberFirstPart, t.numberSecondPart]));

    return timeline;
  }

  createBlockInstructions(block){
    return ExperimentCore.createInstructionsTrial([
        this.localizer.getMessage([
          "NEW_LINE",
          block.modality == VISUAL_MODALITY ? "VISUAL_MODALITY_DISPLAY" : "AUDITORY_MODALITY_DISPLAY"
        ], [block.min, block.max], "p") +
        this.localizer.getMessage("TRAINING_START", [], "p")
      ], this.localizer.getMessage("NEXT"), undefined);
  }

  createTestTrial(blockData, numberFirstPart, numberSecondPart, value, numberType, isTraining = false, acceptOutOfBounds = true){
    if (!acceptOutOfBounds & value <= blockData.min - EPSILON)
      return null;
    if (!acceptOutOfBounds & value >= blockData.max + EPSILON)
      return null;
    // console.log(value, range.min, range.max)

    // Ignore if it doesn't fall right.
    if (  (Math.abs(value % MINOR_GRADUATION_VALUE) > EPSILON)
    & (Math.abs(value % MINOR_GRADUATION_VALUE - MINOR_GRADUATION_VALUE) > EPSILON ))
      return null;

    return {
      type: numberToLine,
      domainType: LineRenderer.ID,
      rangeMinimum: blockData.min,
      rangeMaximum: blockData.max,
      numberType: numberType,
      numberFirstPart: numberFirstPart,
      numberSecondPart:numberSecondPart,
      minorGraduationInterval: MINOR_GRADUATION_VALUE,
      isTraining: isTraining,
      modality: blockData.modality,
      timeLimit: isTraining ? -1 : TRIAL_TIME_LIMIT,
      outOfLineSmallerResponsePanelText: this.localizer.getMessage("SMALLER"),
      outOfLineGreaterResponsePanelText: this.localizer.getMessage("GREATER"),
      extensions: [
        {type: jsPsychExtensionMouseTracking}
      ],
      audioVoice: this.voice,
    }
  }

  createTestTrialFromRational(blockData, target, isTraining = false){
    switch (target.id){
      case Fraction.ID:
        return this.createTestTrial(blockData, target.numerator, target.denominator, target.value, target.id, isTraining);
      case Decimal.ID:
        return this.createTestTrial(blockData, target.wholePart, target.decimalPart, target.value, target.id, isTraining);
      case WholeNumber.ID:
        return this.createTestTrial(blockData, target.value, -1, target.value, target.id, isTraining);
      default:
        throw new Error(`Invalid number type: ${target.id} !`);
    }
  }

  createSubBlock(block, testTargets, targetsCheck = function(target){return true;}, previousTrial = null){
    let blockTrials = [];

    for (let target of testTargets){
      let trial = this.createTestTrialFromRational(block, target);

      if (trial != null && targetsCheck(target))
        blockTrials.push(trial);
    }

    let areTrialsEqual = (t1, t2) =>
        t1.numberType == t2.numberType && t1.numberFirstPart == t2.numberFirstPart && t1.numberSecondPart == t2.numberSecondPart;

    // Shuffle once
    blockTrials = jsPsych.randomization.shuffleNoRepeats(blockTrials, areTrialsEqual);

    if (previousTrial != null){
      while( areTrialsEqual(blockTrials[0], previousTrial) ){
        // Reshuffle until the first trial is different from the previous one
        blockTrials = jsPsych.randomization.shuffleNoRepeats(blockTrials, areTrialsEqual);
      }
    }

    return blockTrials;
  }

  // TODO ADEQUATE NAME?
  createTrainingFinishedTrial(){
    return ExperimentCore.createInstructionsTrial(
      [
        this.localizer.getMessage("TRAINING_FINISHED", [], "p") +
        this.localizer.getMessage("NO_CORRECTION", [], "p")
      ], this.localizer.getMessage("START"), undefined);
  }

  createShortFeedbackTrial(numberOfTrialsSinceLastFeedback){
    let localizer = this.localizer
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

  //TODO this will probebaly be a plugin later
  createGlobalFeedBackTrial(){
    let core = this;
    let feedbackPagesFunction = function(){
      let trials = jsPsych.data.get().values().filter(t => t.trial_type == "numberToLine");
      let wholeNumberTrials = trials.filter(t => t.numberType == WholeNumber.ID);
      let decimalTrials = trials.filter(t => t.numberType == Decimal.ID);
      let fractionTrials = trials.filter(t => t.numberType == Fraction.ID);

      let flagCount = []
      for (let flag in ErrorFlags){
        flagCount.push({flag: flag, n: fractionTrials.filter(t => t.errorFlags.some(f => f == flag)).length});
      }

      let max = flagCount.reduce((acc, e) => e.n > acc.n ? e : acc);

      console.log(flagCount, max)

      let getProportionCorrect = (trials) => {return Math.round(trials.filter(t => t.correct).length / trials.length * 100);}

      let firstDescription = core.localizer.getMessage("ACCURACY_DESCRIPTION",
          [getProportionCorrect(trials)], "p") +
        core.localizer.getMessage("WHOLE_NUMBER_SCORE_FEEDBACK",
          [getProportionCorrect(wholeNumberTrials)], "p") +
        core.localizer.getMessage("DECIMAL_SCORE_FEEDBACK",
          [getProportionCorrect(decimalTrials)], "p") +
        core.localizer.getMessage("FRACTION_SCORE_FEEDBACK",
          [getProportionCorrect(fractionTrials)], "p")

      return [firstDescription + core.localizer.getMessage("THANK_YOU", [], "p")];
    }

    return ExperimentCore.createInstructionsTrial(
      feedbackPagesFunction,
      this.localizer.getMessage("NEXT"),
      this.localizer.getMessage("PREVIOUS")
    );
  }
}
