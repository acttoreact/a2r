#!/usr/bin/env node
import commandLineArgs from 'command-line-args';
import commandLineCommands from 'command-line-commands';

import { ParsedArgs, RunningCommand } from '../model';

import getVersion from './getVersion';
import { globalArguments, mergeArguments } from './commandLine';
import { commandsMap } from './commands';

interface CommandError extends Error {
  command: string;
}

const run = async (): Promise<void> => {
  const helpCommand = commandsMap.get('help')!;
  let parsedArgs: ParsedArgs;

  try {
    parsedArgs = commandLineCommands(
      Array.from(commandsMap.keys()),
      process.argv.slice(2),
    );
  } catch (error) {
    if ((error as CommandError).name === 'INVALID_COMMAND') {
      await helpCommand.run({
        commandName: (error as CommandError).command,
        options: {},
        argv: [],
      });
      return;
    }
    throw error;
  }

  const commandName = parsedArgs.command!;
  const { argv } = parsedArgs;
  const command = commandsMap.get(commandName)!;
  const commandDefinitions = mergeArguments([command.args, globalArguments]);
  const options = commandLineArgs(commandDefinitions, { argv, partial: true });
  const info: RunningCommand = {
    commandName,
    argv,
    options,
  };
  if (command.name !== 'update') {
    await getVersion(true);
  }
  await command.run(info);
};

run();
