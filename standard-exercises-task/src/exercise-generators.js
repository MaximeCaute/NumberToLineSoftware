//import * as Rational from ../number-to-line-task/src/math/rational.js

// TODO move to a localizer
function fractionToWords(numerator, denominator){
  numerator = parseInt(numerator)
  denominator = parseInt(denominator)

  const numberNames = [
    "zéro", "un", "deux", "trois", "quatre", "cinq",
    "six", "sept", "huit", "neuf", "dix", "onze", "douze"
  ];

  let numeratorWord = numberNames[numerator];

  let singularDenominatorWord = null;
  switch (denominator) {
    case 2:
      singularDenominatorWord = 'demi'
      break;
    case 3:
      singularDenominatorWord = 'tiers'
      break;
    case 4:
      singularDenominatorWord = 'quart'
      break;
    default:
      let canonicalDenominatorRoot = numberNames[denominator].replace(/e$/, "").replace(/f$/, "v");
      singularDenominatorWord =`${canonicalDenominatorRoot}ième`;
  }
  let denominatorWord = `${singularDenominatorWord}${!singularDenominatorWord.endsWith("s") && numerator > 1 ? "s" : ""}`

  return `${numeratorWord} ${denominatorWord}`
}
console.log([[1,2], [1,3], [1,4], [1,5], [1,12], [3,2], [3,3], [3,4], [3,5], [3,12]].map((n,d) => fractionToWords(n,d)))


class ExerciseGenerator {
  constructor(jsPsych){
    this.jsPsych = jsPsych;
  }

  static createSurveyOptions(options) {
    let optionsDivs = options.map(o =>  `
      <div class="option-container">
        <label class="fraction-label">
          ${o.html}
          <input type="radio" name="fraction" value="${o.value}" required>
        </label>
      </div>
    `)

    return `
      <div class="options-container">
        ${optionsDivs.join("\n")}
      </div>
    `
  }

  generateIntegerArithmeticExerciseProcedure(items, randomize = false){
    // TODO : I think every generate... could simply define the timeline: everything else is similar
    let exerciseProcedure = {
      timeline: [
        {
            type: jsPsychSurveyHtmlForm,
            preamble: `<h4>Calcule le résultat :</h4>`,
            html: () => `
              <div style="display:flex">
                <div style="display: flex; flex-direction: column; justify-content: center">
                  <p>
                  ${this.jsPsych.timelineVariable("operand1")}
                  ${this.jsPsych.timelineVariable("operator")}
                  ${this.jsPsych.timelineVariable("operand2")}
                  =
                  </p>
                </div>
                <div class="fraction-input">
                  <input type="number" id="value" name="value" placeholder=" " required>
                </div>
              </div>
            `,
            data: {
              target1: this.jsPsych.timelineVariable("operand1"),
              operation: this.jsPsych.timelineVariable("operator"),
              target2: this.jsPsych.timelineVariable("operand2"),
              exercise: "fraction_comparison",
              format: "digits",
              framing: "numerical",
              correct_response: () => {
                let operand1 = parseInt(this.jsPsych.timelineVariable("operand1"));
                let operand2 = parseInt(this.jsPsych.timelineVariable("operand2"));
                let operator = this.jsPsych.timelineVariable("operator");

                switch (operator){
                  case "+":
                    return operand1 + operand2;
                  case "-":
                    return operand1 - operand2;
                  case "x":
                  case "*":
                    return operand1 * operand2;
                  case "÷":
                  case ":":
                  case "/":
                    return operand1 / operand2;
                  default:
                    console.error(`Unknow operator: ${operator}`)
                }
              },
            },
            button_label: "Suivant",
            on_finish: function(data){
              data.response = data.response["value"]
            }
        }
      ],
      timeline_variables: items,
      randomize_order: randomize
    };

    return exerciseProcedure;
  }

  // TODO randomize effect
  generateFractionComparisonExerciseProcedure(items, randomize = false){
    function generatePreamble(target1, target2, format, framing){
      let fractionFormatFunction = null;
      switch (format) {
        case "digits":
          fractionFormatFunction = createFractionHTML;
          break;
        case "letters":
          fractionFormatFunction = fractionToWords;
          break
        default:
          throw new Error(`Invalid format ${format}`);
      }

      let target1Components = target1.split("/");
      let target2Components = target2.split("/");

      let preamble = `
        <h4>Complète la phrase suivante :</h4>
        <div>
          ${fractionFormatFunction(target1Components[0], target1Components[1])}
          ${framing == "numerical" ? "c'est [...] que " : `se place${parseInt(target1Components[0])> 1 ? "nt" : ""} [...]`}
          ${fractionFormatFunction(target2Components[0], target2Components[1])}
        </div>
      `
      return preamble;
    }

    // TODO FORMATcomparison
    let exerciseProcedure = {
      timeline: [
        {
          type: jsPsychSurveyMultiChoice,
          preamble: () => generatePreamble(
            this.jsPsych.timelineVariable("target1"),
            this.jsPsych.timelineVariable("target2"),
            this.jsPsych.timelineVariable("format"),
            this.jsPsych.timelineVariable("framing")
          ),
          questions: [
            {
              prompt: "",
              options: () => this.jsPsych.timelineVariable("framing") == "numerical" ?
                ["plus petit", "la même chose", "plus grand"] :
                ["avant", "au même endroit que", "après"],
              required: true, horizontal: true
            }
          ],
          data: {
            target1: this.jsPsych.timelineVariable("target1"),
            target2: this.jsPsych.timelineVariable("target2"),
            exercise: "fraction_comparison",
            format: this.jsPsych.timelineVariable("format"),
            framing: this.jsPsych.timelineVariable("framing"),
            correct_response: () => {
              // TODO implement type check in Rational.parse
              let fraction1 = Rational.parse(this.jsPsych.timelineVariable("target1"));
              let fraction2 = Rational.parse(this.jsPsych.timelineVariable("target2"));

              let crossProduct1 = fraction1.numerator * fraction2.denominator;
              let crossProduct2 = fraction2.numerator * fraction1.denominator;

              if (MathUtils.isEqualWithMargin(crossProduct1, crossProduct2, Number.EPSILON)){
                return "equivalent";
              } else if (crossProduct1 < crossProduct2) {
                return "smaller";
              } else {
                return "greater";
              }
            }
          },
          button_label: "Question suivante",
          on_finish: function(data) {
            let response = data.response["Q0"];
            data.raw_response = response;

            switch (response){
              case "plus petit":
              case "avant":
                data.response = "smaller";
                break;
              case "la même chose":
              case "au même endroit que":
                data.response = "equivalent";
                break;
              case "plus grand":
              case "après":
                data.response = "greater";
                break;
              default:
                console.error(`Invalid response: ${response}`)
            }
          },
        }
      ],
      timeline_variables: items,
      randomize_order: randomize
    }

    return exerciseProcedure;
  }

  generateForcedChoiceFractionAdditionExerciseProcedure(items, randomize = false){
    function createPreamble(target1, target2, operator, format, framing){
      let target1Components = target1.split("/");
      let target2Components = target2.split("/");

      return `
        <h4>Choisis le bon résultat :</h4>
        <div>
          ${createFractionHTML(target1Components[0], target1Components[1])}
          ${operator}
          ${createFractionHTML(target2Components[0], target2Components[1])}
          =
          [...]
        </div>
      `
    }

    // todo randomize choices
    let exerciseProcedure = {
      timeline: [
        {
            type: jsPsychSurveyHtmlForm,
            preamble: () =>
              createPreamble(
                this.jsPsych.timelineVariable("operand1"),
                this.jsPsych.timelineVariable("operand2"),
                "+",
                this.jsPsych.timelineVariable("format"),
                this.jsPsych.timelineVariable("framing"),
              ),
            html: () =>
              ExerciseGenerator.createSurveyOptions(
                this.jsPsych.randomization.shuffleNoRepeats(
                  this.jsPsych.timelineVariable("choices")
                  .map(f => f.split("/"))
                  .map(([n, d]) => {return {html: createFractionHTML(n, d), value: `${n}/${d}`}})
                )
              ),
            data: {
              target1: this.jsPsych.timelineVariable("operand1"),
              target2: this.jsPsych.timelineVariable("operand2"),
              operation: "+",
              exercise: "fraction_addition",
              format: this.jsPsych.timelineVariable("format"),
              framing: this.jsPsych.timelineVariable("framing"),
              correct_response: () => {
                let fraction1 = Rational.parse(this.jsPsych.timelineVariable("operand1"));
                let fraction2 = Rational.parse(this.jsPsych.timelineVariable("operand2"));

                // TODO probably should be a method of Rational
                let commonDenominator = MathUtils.getLCM(fraction1.denominator, fraction2.denominator)
                let fraction1Multiple = commonDenominator / fraction1.denominator
                let fraction2Multiple = commonDenominator / fraction2.denominator

                return `${
                    fraction1Multiple * fraction1.numerator
                    + fraction2Multiple * fraction2.numerator
                  }/${commonDenominator}`
              }
            },
            button_label: "Suivant",
            on_finish: function(data){
              data.response = data.response["fraction"]
            }
        }
      ],
      timeline_variables: items,
      randomize_order: randomize
    };

    return exerciseProcedure;
  }

  generateFreeChoiceFractionAdditionExerciseProcedure(items, randomize = false){
    // todo postamble
    function createFractionInputHTML(preamble){
      return `
       <div class="options-container" style="display:flex">
         <div style="display:flex; align-items: center;"><p style="text-align: center">
           ${preamble}
         </p></div>
         <div class="fraction-input">
           <input type="number" id="num" name="numerator" placeholder=" " required>
           <div class="fraction-line"></div>
           <input type="number" id="den" name="denominator" placeholder=" " required>
         </div>
         <div id="error" class="error-msg">Please enter valid numbers for numerator and denominator.</div>
       </div>
     `;
    }

    function createLeftSide(target1, target2, operator, format, framing){
      let target1Components = target1.split("/");
      let target2Components = target2.split("/");

      return `
        ${createFractionHTML(target1Components[0], target1Components[1])}
        ${operator}
        ${createFractionHTML(target2Components[0], target2Components[1])}
        =
      `
    }

    // todo randomize choices
    let exerciseProcedure = {
      timeline: [
        {
            type: jsPsychSurveyHtmlForm,
            preamble: "<h4>Calcule le résultat :</h4>",
            html: () => createFractionInputHTML(
              createLeftSide(
                  this.jsPsych.timelineVariable("operand1"),
                  this.jsPsych.timelineVariable("operand2"),
                  "+",
                  this.jsPsych.timelineVariable("format"),
                  this.jsPsych.timelineVariable("framing"),
                )
              ),
              data: {
                target1: this.jsPsych.timelineVariable("operand1"),
                target2: this.jsPsych.timelineVariable("operand2"),
                operation: "+",
                exercise: "fraction_addition",
                format: this.jsPsych.timelineVariable("format"),
                framing: this.jsPsych.timelineVariable("framing"),
                correct_response: () => {
                  let fraction1 = Rational.parse(this.jsPsych.timelineVariable("operand1"));
                  let fraction2 = Rational.parse(this.jsPsych.timelineVariable("operand2"));

                  // TODO probably should be a method of Rational
                  let commonDenominator = MathUtils.getLCM(fraction1.denominator, fraction2.denominator)
                  let fraction1Multiple = commonDenominator / fraction1.denominator
                  let fraction2Multiple = commonDenominator / fraction2.denominator

                  return `${
                      fraction1Multiple * fraction1.numerator
                      + fraction2Multiple * fraction2.numerator
                    }/${commonDenominator}`
                }
            },
            button_label: "Suivant",
            on_finish: function(data){
              data.raw_response = data.response;
              data.response = `${data.raw_response["numerator"]}/${data.raw_response["denominator"]}`;
            }
        }
      ],
      timeline_variables: items,
      randomize_order: randomize
    };

    return exerciseProcedure;
  }

  generateFractionBrackettingExerciseProcedure(items, randomize = false){
    // TODO use framing and format
    function generatePreamble(target, framing, format){
      let components = target.split("/");
      let numerator = components[0]
      let denominator = components[1]

      return `
        <h4> Complète la phrase suivante : </h4>
        <div>
          La fraction
          ${createFractionHTML(numerator, denominator)}
          peut se placer entre les entiers...
        </div>
      `

    }

    let exerciseProcedure = {
      timeline: [{
        type: jsPsychSurveyMultiChoice,
        preamble: () => generatePreamble(
           this.jsPsych.timelineVariable("target"),
           this.jsPsych.timelineVariable("framing"),
           this.jsPsych.timelineVariable("format")
        ),
        questions: [{
          prompt: "",
          options: () => this.jsPsych.timelineVariable("choices").map(([a, b]) => `${a}${" et "}${b}`),
          required: true, horizontal: true,
        }],
        data: {
          target1: this.jsPsych.timelineVariable("target"),
          format: this.jsPsych.timelineVariable("format"),
          framing: this.jsPsych.timelineVariable("framing"),
          exercise: "bracket_fraction",
          correct_response: () => {
            let fraction = Rational.parse(this.jsPsych.timelineVariable("target"))

            return `${Math.floor(fraction.value)} - ${Math.ceil(fraction.value)}`;
          }
        },
        button_label: "Question suivante",
        on_finish: function(data){
          data.raw_response = data.response["Q0"];
          data.response = data.raw_response.replace(" et ", " - ");
        }
      }],
      timeline_variables: items,
      randomize_order: randomize
    }

    return exerciseProcedure;
  }

  generateFractionSelectionExerciseProcedure(items, jsPsych, randomize = false){
    let jsons = []
    for(let item of items){
      let choices = [];
      for (let choice of item.choices){
        choices.push({
          value: `${choice.target} - ${choice.model}`,
          fraction: choice.target,
          model: choice.model,
          imageLink: `./res/fraction-images/${choice.filename}.png`,
          text: null
        })
      }

      let components = item.target.split("/");
      let numerator = components[0];
      let denominator = components[1];

      let json = {
        elements: [
           {
             type: "imagepicker",
             name: "fraction-model",
             // Not working, because the text is wrapped in a span of class "sv-string-viewer" which displays html as plain text.
             // "title": `Choisis la fraction qui correspond à ${createFractionHTML(numerator, denominator)}`,
             title: `Choisis la fraction qui correspond à ${item.target}`,
             description: "",
             isRequired: true,
             choices: choices,
             showLabel: false,
             multiSelect: false,
             imageWidth: 200,
             imageHeight: 200,
           }
        ],

        // We save this at the root of the json for putting in jspsych data
        target: item.target,
        format: item.format,
      };

      jsons.push(json)
    }

    if (randomize)
      jsons = this.jsPsych.randomization.shuffle(jsons)

    let timeline = []
    for (let json of jsons){
      let surveyTrial = {
       type: jsPsychSurvey,
       survey_json: {
         title: null,
         completeText: 'Suivant',
         pages: [json]
       },
       data: {
         target1: json.target,
         choices: json.elements[0].choices,
         format: json.format,
         exercise: "fraction_image_matching",
         correct_response: () => {
           let targetFraction = Rational.parse(json.target);
           for (let choice of json.elements[0].choices){
             let choiceFraction = Rational.parse(choice.fraction);
             let areEquivalent = MathUtils.isEqualWithMargin(
               targetFraction.value, choiceFraction.value, Number.EPSILON)

             if (areEquivalent)
              return choice.fraction;
           }
         }
       },
       on_finish: function(data){
         document.getElementById("jspsych-content").innerHTML = "";

         data.raw_response = data.response["fraction-model"];
         data.response = data.raw_response.split(" - ")[0];
       }
      };

      timeline.push(surveyTrial)
    }

    return {timeline: timeline};
  }
}
