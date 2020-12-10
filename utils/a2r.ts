#!/usr/bin/env node
import args from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { out } from '@a2r/telemetry';

import write from '../tools/write';
import getVersion from './getVersion';
import { commandLineRules, commandLineHelp } from './commandLine';
import init from './init';
import update from './update';
import add from './add';
import start from './start';
import npmInstall from './npmInstall';
import stop from './stop';
import dev from './dev';
import { terminalCommand } from './colors';

const options = args(commandLineRules);

if (options.help) {
  write(`${commandLineUsage(commandLineHelp)}\n\n`);
} else {
  const run = async (): Promise<void> => {
    if (options.update) {
      await update();
    } else {
      await getVersion(true);
      if (options.add) {
        const [project, destination, baseProjectPath] = options.add;
        await add(project, destination, baseProjectPath);
      } else if (options.init) {
        await init();
      } else if (options.start) {
        await start();
      } else if (options.dev) {
        const [projectPath] = options.dev;
        if (projectPath) {
          await dev(projectPath);
        } else {
          out.warn('You must specify a project to run');
        }
      } else if (options.npm) {
        const [install, ...params] = options.npm;
        if (install === 'install') {
          await npmInstall(params);
        } else {
          out.warn(
            `Option ${terminalCommand(
              'npm',
            )} can only be followed by ${terminalCommand('install')}`,
          );
        }
      } else if (options.stop) {
        await stop();
      } else if (!options.version) {
        out.warn('Unknown or missing option');
        write(`${commandLineUsage(commandLineHelp)}\n\n`);
      }
    }
  };

  run();
}
