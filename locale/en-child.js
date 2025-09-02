class ChildEnglishLocalizer extends Localizer {
  constructor(){
    super();

    this.messages = {
      "ID_QUERY": "Please enter your ID",

      "RANDOM_ID_GENERATED": `A random ID was generated for this participant:</p><p>${Localizer.FORMATTABLE_MARKER}`,

      "FULLSCREEN_PROMPT": "Are you ready to start?",
      "FULLSCREEN_LABEL": "Yes!",

      "SPACE_BAR": `<b>[SPACE]</b>`,
      "PRESS_ANY_KEY": `Press any key to start.`,
      "START": "Start",
      "PREVIOUS": "Previous",
      "NEXT": "Continue",
      "TERMINATE": "Finish",

      "NEW_LINE": `The line will go from <strong>${Localizer.FORMATTABLE_MARKER} to ${Localizer.FORMATTABLE_MARKER}</strong>.`,
      "VISUAL_MODALITY_DISPLAY": `The numbers will be <strong>displayed</strong> on the sign.`,
      "AUDITORY_MODALITY_DISPLAY": `The numbers will be <strong>read aloud</strong>.`,
      "TRAINING_START": `We will start with a bit of training. A sound will tell you if you answered correctly.`,
      "TRAINING_FINISHED": "You have now finished training.",
      "NO_CORRECTION": `The next numbers will not be corrected, even if your answer is wrong.`,

      "ACCURACY_DESCRIPTION": `You managed to place ${Localizer.FORMATTABLE_MARKER}% of numbers.`,
      "ENCOURAGEMENT_POOR": `Don't worry, you will do better next time!`,
      "ENCOURAGEMENT_GOOD": `That's good, but you can do even better!`,
      "CONGRATULATIONS": `Congratulations, keep up with the good work!`,
      "BLOCK_ENDED": `Good work, this part is now over!`,

      "NUMBER_TO_LINE_EXPERIENCE_ENDED": `You have finished this game, but there is more to play! Click on the button below to start the next game!`,
      "RESPONSES_SAVED": `Your responses have been duly saved. <strong>Thank you!</strong>`,

      "INSTRUCTIONS_TITLE": `Instructions ${Localizer.FORMATTABLE_MARKER}`,
      "INSTRUCTIONS_TEXT_1": `In this game, you will see a number line with graduations.`,
      "INSTRUCTIONS_DISPLAY": `There will be a button above the line. Click it, and you will receive a number displayed on a sign.`,
      "INSTRUCTIONS_RESPONSE": ` <b>Place this number on its correct position on the line!</b> Drag the sign to the line, then click again to drop it where you want to answer!`,
      "INSTRUCTIONS_RESPONSE_TIME": `Try to answer as soon as you have the (correct) answer. You will have approximately <strong>${Localizer.FORMATTABLE_MARKER} seconds</strong> after the button appears.`,
      "INSTRUCTIONS_RECORDING": `We will register your accuracy and response time.
                                  Don't worry if you make a mistake, just try your best to answer correctly!`,

      "SMALLER": "SMALLER",
      "GREATER": "GREATER",

      "WHOLE_NUMBER_SCORE_FEEDBACK": `You managed to place ${Localizer.FORMATTABLE_MARKER}% of integers.`,
      "DECIMAL_SCORE_FEEDBACK": `You managed to place ${Localizer.FORMATTABLE_MARKER}% of decimal numbers.`,
      "FRACTION_SCORE_FEEDBACK": `You managed to place ${Localizer.FORMATTABLE_MARKER}% of fractions.`,
      "POINTS_SCORE_FEEDBACK": `Tu as marqué <strong>${Localizer.FORMATTABLE_MARKER} points</strong> sur ${Localizer.FORMATTABLE_MARKER}.
        Continue de t'entraîner pour progresser !`,

      "THANK_YOU": "Thank you for your participation!",

      "LEXICAL_DECISION_TASK_INSTRUCTIONS_TITLE": "Game rules",
      "LEXICAL_DECISION_TASK_INSTRUCTIONS_CONTEXT": "Traps have snucked into the dictionary... Help us find them!</br> </br>You will see words appear on the screen.",
      "LEXICAL_DECISION_TASK_INSTRUCTIONS_KEYS": `
        If it's a trap, press <strong>'${Localizer.FORMATTABLE_MARKER}'</strong> to send it into the <strong>chimney</strong>.
        If its a real word, press <strong>'${Localizer.FORMATTABLE_MARKER}'</strong> to send it into the <strong>dictionary</strong>.`,
      "LEXICAL_DECISION_TASK_INSTRUCTIONS_BUTTON_LABEL": "Start training!",
      "LEXICAL_DECISION_TASK_INSTRUCTIONS_REMINDER":
        `Put your <strong>right index on '${Localizer.FORMATTABLE_MARKER}'</strong>
        and your <strong>left index on '${Localizer.FORMATTABLE_MARKER}'</strong>.
        </br></br> Ready ? </br></br>
        Press '${Localizer.FORMATTABLE_MARKER}' and let's go!`,

      "NUMBER_COMPARISON_START_TRAINING": `
          Oh no!
          I wanted to know if there was more <strong style='color: blue'>blue</strong>
          or <strong style='color: yellow'>yellow</strong> dots...
          but I spilled them on the floor! Can you help me?
          <br/><br/>
          You will see clouds of dots:
          press <strong style='color: blue'>'F'</strong> if there are more blue dots,
          and <strong style='color: yellow'>'J'</strong> if there are more yellow dots.
          <br/><br/>
          You will start with some training.
          Press the key for <strong style='color: blue'>blue</strong> to start! `,
      "NUMBER_COMPARISON_END_TRAINING": "Good! You have now finished training. Ready for the real game? Press 'F' when ready!",

      "EXPERIENCE_END_MESSAGE": `
        Your answers have been duly saved. <strong>Thank you!</strong>
        Press 'escape' to return to your computer.`
    };
  }
}
