# Number-to-line software

An open-source library for a software allowing experiments around number-to-line tasks

## Structure overview

The logic is that any new experiment should only require changing `index.html` and `config/...-task/`

- `index.html` This is the starting file of the software. It is the one that should be opened for a regular experiment.
- `exercises_index.html`. Alternative starting file which allows to select a configuration among others. Used in an intervention.
- `common/`. Folder with helpers and common resources (feedback sounds, fonts...)
- `config/`. Folder with configuration of the different tasks. It should probably also handle the behavior of the index someday.
- `libraries/`. External libraries used in the project.
- `locale/`. Contains code and data related to localizing the software in different languages (currently supported: French and English -- in child-friendly versions)
- `number-to-line-task/`. **Core folder.** This folder holds all the logic used to run the Number-to-line task, from instructions to data saving.

### `Number-to-line` folder.

- `experiment.html`. The main file for the number-to-line task. Initializes jsPsych, reads config and queries, and launches the task using jsPsych.
- `res/`. The resource folder. Contains the images of the written fractions, the audio of the fraction read aloud, and the illustrations of the instructions.
- `src/`. The source folder. Contains all the code allowing for running a number-to-line trial and creating a timeline with it (including instructions).
  - `src/experiment-core.js` This file deals with the main time line of the task: it handles everything that is wrapped around number-to-line trials such as instructions.
  - `src/instructions-template.js` This file can be used to create localized instructions, with `toHTMLPages(localizer)`.
  - `src/plugin-number-to-line.js`. A jsPsych plugin that handles a single trial of a number-to-line task given a number of parameters.
  - `src/config/`. probably a terribly named folder. Contains all constants used in the code (thrown in without much logic) and the logic for the formatting of queries.
  - `src/gui/`. Contains all the elements displayed on screen during the task. The "line" is displayed by the ill-named `renderer.js` file. Also, `tick.js` is just a data structure whose presence here is debattable
  - `src/math/`. Contains all the math related logic: definition of rational numbers, of error types with rationals, and of what a number line is (mathematically).

## Creating a new experiment.

Index should pass an ID, file without extension (fetched in `config/number-to-line-task/`, can include a subpath) & session parameter & save parameter (todo, format into proper boolean)

# TODO

## Desired new features

- Warning : if there are feeback videos, children should be prompted to have headphones
- Allowing for custom config for intervention
- Points maximum should be implemented.
- Make it usable for teachers to give a note (should be an option).
- Alt text should not be 'fraction' when no text is available

## Known bugs
- Decimal parsing can bug if there are trailing 0s in the decimal part : 0.02 will be parsed as Decimal(0, 2). This bug should be fixed by turning every parameter in Rational constructors into strings.
