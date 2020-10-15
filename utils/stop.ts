import path from 'path';
import { spawn } from 'child_process';
import { exists } from '@a2r/fs';

import getProjectPath from './getProjectPath';
import { log, terminalCommand, fileName } from './colors';

const stop = async (): Promise<void> => {
  const mainProjectPath = await getProjectPath();
  const dockerComposePath = path.resolve(
    mainProjectPath,
    '.a2r',
    'docker-compose.yml',
  );
  if (await exists(dockerComposePath)) {
    const args = ['-f', dockerComposePath, 'down'];
    log(
      `Running docker-compose: ${terminalCommand(
        `docker-compose ${args.join(' ')}`,
      )}`,
    );

    const command = spawn('docker-compose', args, { stdio: 'pipe' });
    command.stdout.pipe(process.stdout);
    command.stderr.pipe(process.stdout);
  } else {
    log(
      `Couldn't find ${terminalCommand('docker-compose')} file at ${fileName(
        dockerComposePath,
      )}`,
    );
  }
};

export default stop;
