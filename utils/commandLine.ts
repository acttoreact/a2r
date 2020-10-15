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
    name: 'dev',
    type: String,
    multiple: true,
  },
  {
    name: 'stop',
    type: Boolean,
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
    content: `The isomorphic, reactive ${chalk.italic('framework')} that scales.`,
  },
  {
    content: logo,
    raw: true,
  },
  {
    header: 'Synopsis',
    content: '$ npx a2r <command> [options]\n$ npx a2r --help\n$ npx a2r --add next www',
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
        typeLabel: '{underline project} {underline destination}',
        description: `Creates project in solution ('next' or 'expo') at desired destination folder`,
      },
      {
        name: 'dev',
        typeLabel: '[{underline force}]',
        description: `Runs watcher and server`,
      },
      {
        name: 'stop',
        typeLabel: ' ',
        description: `Stops watcher and server`,
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
