import commandLineUsage from 'command-line-usage';
import { out } from '@a2r/telemetry';

import { Command, RunningCommand } from '../model';

import write from '../tools/write';
// eslint-disable-next-line import/no-cycle
import { globalHelp, globalArguments } from './commandLine';
// eslint-disable-next-line import/no-cycle
import { commandsMap } from './commands';

export const printCommandUsage = (commandName: string): void => {
  const command = commandsMap.get(commandName)!;
  const usage:
    | commandLineUsage.Content
    | commandLineUsage.OptionList
    | commandLineUsage.Section[] = [
    {
      header: `a2r ${command.name}`,
      content: command.description,
    },
  ];
  if (command.args.length) {
    usage.push({ header: 'Command Options', optionList: command.args });
  }
  usage.push({ header: 'Global Options', optionList: globalArguments });
  write(`${commandLineUsage(usage)}\n\n`);
};

const help = async (info: RunningCommand): Promise<void> => {
  const { commandName, argv } = info;
  if (!commandName) {
    out.warn(`No command given, printing global help...`);
    write(`${commandLineUsage(globalHelp)}\n\n`);
    return;
  }
  const command = commandsMap.get(commandName);
  if (!command) {
    out.warn(`No valid command: ${commandName}. Printing global help...`);
    write(`${commandLineUsage(globalHelp)}\n\n`);
    return;
  }
  const [commandToShow] = argv;
  if (!commandsMap.has(commandToShow)) {
    out.warn(`No valid command: ${commandToShow}. Printing global help...`);
    write(`${commandLineUsage(globalHelp)}\n\n`);
    return;
  }
  printCommandUsage(commandToShow);
};

const command: Command = {
  name: 'help',
  description: 'Prints this usage guide',
  run: help,
  args: [],
};

export default command;
