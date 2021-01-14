import chalk from 'chalk';
import { OptionDefinition } from 'command-line-args';

import { CommandArg } from '../model';

import { fileName, framework, logo } from './colors';
// eslint-disable-next-line import/no-cycle
import { commandsMap } from './commands';

export const globalArguments: CommandArg[] = [
  {
    name: 'settings',
    description: `Set a specific settings ${chalk.italic('json')} file to use (must be inside ${fileName('.a2r')} folder). Default: ${fileName('settings.json')}`,
    type: String,
    typeLabel: '{underline fileName}',
  },
];

export const mergeArguments = (
  argumentsLists: CommandArg[][],
): OptionDefinition[] => {
  const argsMap = new Map<string, CommandArg>();
  for (let i = 0, l = argumentsLists.length; i < l; i++) {
    const list = argumentsLists[i];
    for (let j = 0, k = list.length; j < k; j++) {
      const command = list[j];
      argsMap.set(command.name, {
        ...(argsMap.get(command.name) || {}),
        ...command,
      });
    }
  }
  return Array.from(argsMap.values());
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseARgs = (commandOptions: any): { [name: string]: any } => ({
  ...((commandOptions && commandOptions._all) || {}),
});

const commandNamesReplacements: { [key: string]: string } = {
  'npm': 'npm install',
};

/**
 * Command line help containing information about available command options
 */
export const globalHelp = [
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
    header: 'Commands commands',
    content: Array.from(new Set(commandsMap.values())).map((command) => ({
      name: chalk.bold(commandNamesReplacements[command.name] || command.name),
      summary: command.description,
    })),
  },
  {
    header: 'Global options',
    optionList: globalArguments,
  },
  {
    header: 'Synopsis',
    content:
      '$ npx a2r <command> [options]\n$ npx a2r help\n$ npx a2r add --type next --dest www\n$ npx a2r add --type electron --dest desktop --base www\n$ npx a2r dev --project www',
  },
  {
    content: 'Run `npx a2r help <command>` for help with a specific command.',
    raw: true,
  },
];
