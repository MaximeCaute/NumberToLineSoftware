# Number-to-line software

An open-source library for a software allowing experiments around number-to-line tasks

## Logic.

### Experiments and tasks

A research experiment using the library has two level: experiment and task

An **experiment** contains
- an initialization (fetching experiment configuration, asking for ID, parameter choice)
- a series of **tasks**
- an end (data saving, thanking the participant...)

A **task** contains
- an initialization (fetching trial parameters, task gui configuration...)
- a **timeline** (series of trials/timelines)
- an end (data saving, redirection to the experiment)

### Configuration

- Experiment configuration
  - Global GUI information
  - Paths to the tasks and their order

Tasks should be defined in their own folder. But where do their configuration go?

#### The Number Line task

Core task of the library.

- GUI configuration file
- Main trials configuration file (defines the trial on the number line)
- Secondary trials configuration file (defines, e.g., data about texts) => Currently hardcoded.

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

## Starting an experiment

If you are planning to test the script directly on your machine, please note that you will first have to setup a local server (one possible way: open a terminal in the project folder and enter `python -m http.server`). This is due to browsers preventing access to other files when executing a file that is saved locally and requiring a sandbox instead. 

To launch the experiment, access the file `index.html`, which should be at the root of the project. If you opened the server locally with python, you should simply have to type in `localhost:8000` (or equivalently `localhost:8000/index.html`) in your browser's URL bar. 

Note that there may be other `XXX_index.html` files lying in the project, which were created to have alternate experimental configurations. We are currently working in merging these configurations as configuration files.

## Creating a new experiment.

Index should pass an ID, file without extension (fetched in `config/number-to-line-task/`, can include a subpath) & session parameter & save parameter (todo, format into proper boolean)
