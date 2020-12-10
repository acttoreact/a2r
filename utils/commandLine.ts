import chalk from 'chalk';

import { framework, logo } from './colors';

/**
 * Command lines rules (used to serialize user input when using a2r command)
 */
export const commandLineRules = [
  {
    name: 'init',
    alias: 'i',
    type: Boolean,
  },
  {
    name: 'add',
    alias: 'a',
    type: String,
    multiple: true,
  },
  {
    name: 'update',
    alias: 'u',
    type: Boolean,
  },
  {
    name: 'start',
    type: Boolean,
  },
  {
    name: 'dev',
    type: String,
    multiple: true,
  },
  // {
  //   name: 'stop',
  //   type: Boolean,
  // },
  {
    name: 'npm',
    type: String,
    multiple: true,
  },
  {
    name: 'version',
    alias: 'v',
    type: Boolean,
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
  },
];

/**
 * Command line help containing information about available command options
 */
export const commandLineHelp = [
  {
    header: framework,
    content: `The isomorphic, reactive ${chalk.italic(
      'framework',
    )} that scales.`,
  },
  {
    content: logo,
    raw: true,
  },
  {
    header: 'Synopsis',
    content:
      '$ npx a2r <command> [options]\n$ npx a2r --help\n$ npx a2r --add next www',
  },
  {
    header: 'Commands',
    optionList: [
      {
        name: 'init',
        alias: 'i',
        typeLabel: ' ',
        description: `Initializes the project for ${framework}`,
      },
      {
        name: 'update',
        alias: 'u',
        typeLabel: ' ',
        description: `Updates the project to the last version of ${framework}`,
      },
      {
        name: 'add',
        alias: 'a',
        typeLabel: '{underline project} {underline destination} [{underline baseProjectPath}]',
        description: `Creates project in solution ('next', 'expo' or 'electron') at desired destination folder`,
      },
      {
        name: 'start',
        typeLabel: ' ',
        description: `Runs watcher and server`,
      },
      {
        name: 'dev',
        typeLabel: '{underline projectPath}',
        description: `Runs the project in that path in dev mode`,
      },
      // {
      //   name: 'stop',
      //   typeLabel: ' ',
      //   description: `Stops watcher and server`,
      // },
      {
        name: 'npm install',
        typeLabel: '[{underline package[@version]}]',
        description: `Install npm packages in working directory project and its docker (if at least created)`,
      },
      {
        name: 'version',
        alias: 'v',
        typeLabel: ' ',
        description: `Gets the current version of ${framework}`,
      },
      {
        name: 'help',
        alias: 'h',
        typeLabel: ' ',
        description: 'Prints this usage guide',
      },
    ],
  },
];
