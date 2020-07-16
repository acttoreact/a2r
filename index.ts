#!/usr/bin/env node
import args from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { out } from '@a2r/telemetry';

import write from './tools/write';
import getVersion from './utils/getVersion';
import { commandLineRules, commandLineHelp } from './utils/commandLine';
import init from './utils/init';
import update from './utils/update';
import add from './utils/add';
import dev from './utils/dev';

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
        const [project, destination] = options.add;
        await add(project, destination);
      } else if (options.init) {
        await init();
      } else if (options.dev) {
        await dev();
      } else {
        out.warn('Unknown or missing option');
        write(`${commandLineUsage(commandLineHelp)}\n\n`);
      }
    }
  };

  run();
}