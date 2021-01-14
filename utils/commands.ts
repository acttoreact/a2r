import { Command } from '../model';

// eslint-disable-next-line import/no-cycle
import help from './help';
import init from './init';
import update from './update';
import add from './add';
import start from './start';
import npmInstall from './npmInstall';
// import stop from './stop';
// eslint-disable-next-line import/no-cycle
import dev from './dev';

export const commands = [help, update, add, init, start, npmInstall, dev];

export const commandsMap: Map<string, Command> = new Map(
  commands.map((command) => [command.name, command]),
);
