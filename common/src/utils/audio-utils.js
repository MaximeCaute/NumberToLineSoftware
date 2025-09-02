let currentScriptURL;
try {
  currentScriptURL = NavigationUtils.createCurrentScriptURLSnapshot();
} catch (e) {
  console.error("Please load NavigationUtils before loading AudioUtils!");
}

// TODO probably not he best name: this creates files with path relative to this file. (btw, it is not meant to be used with another script)
function createAudio(path){
  return new Audio(NavigationUtils.getURLRelativeToSource(path, currentScriptURL));
}

audioUtils = {
  correct: createAudio('../../res/sound/correct.wav'),
  incorrect: createAudio('../../res/sound/incorrect.wav'),
  fanfare: createAudio('../../res/sound/fanfare.mp3'),
  correctStreak: [],
  incorrectStreak: [],
  streakTracker: {positive: true, last: -1},
  resetStreak: function(){this.streakTracker.last = -1},
  initializePositiveStreak: function(start = 1, stop = 7){
    for (let i = start; i <= stop; i++){
      this.correctStreak.push(createAudio(`../../res/sound/pos${i}.wav`));
    }
  },
  initializeNegativeStreak: function(start = 1, stop = 1){
    for (let i = start; i <= stop; i++){
      this.incorrectStreak.push(createAudio(`../../res/sound/neg${i}.wav`));
    }
  },
  playAudioFeedback: function(correct, useStreak = false)
  {
    if (useStreak == null){
      let sound = correct ? this.correct : this.incorrect;
      sound.volume = 0.5;
      sound.play();
      return;
    }

    // Continue streak
    if(this.streakTracker.positive == correct){
      let streak = this.streakTracker.positive ? this.correctStreak : this.incorrectStreak;

      if(this.streakTracker.last < streak.length - 1){
        streak[this.streakTracker.last + 1].play();
        this.streakTracker.last += 1;
      } else {
        streak[this.streakTracker.last].play();
      }

      return;
    }

    // Switch streak and reset count
    this.streakTracker.positive = correct;
    this.resetStreak();
    this.playAudioFeedback(correct, useStreak)
  },
  playFile: function(name){
    console.log(name)
    this.audioDict[name].play();
  },
  audioDict: {},
  // Path are relative to the file that calls the audio dict
  initializeAudioDict(pathNames){
    for (let pathName of pathNames){
      this.audioDict[pathName] = new Audio(pathName);
    }
  },
}
