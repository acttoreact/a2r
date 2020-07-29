import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

import { CommandResponse } from '../model';

/**
 * Executes command on terminal passing all received arguments
 * 
 * If you want to run something like `mkdir -m 777 mydir` you'll need to call this method like
 * `exec('mkdir', ['-m', '777', 'mydir'])`.
 * @param {string} command Command to execute (i.e. `mkdir`)
 * @param {readonly string[]} args Arguments for command (i.e `-m` and `777`)
 * @param {SpawnOptionsWithoutStdio | undefined} options Spawn options (https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
 * @returns {Promise<CommandResponse>} Command response
 */
const exec = (command: string, args: readonly string[], options?: SpawnOptionsWithoutStdio | undefined): Promise<CommandResponse> =>
  new Promise((resolve, reject): void => {
    const res: CommandResponse = {
      command,
      args: args.join(' '),
      closeCode: null,
      exitCode: null,
      stdout: '',
      stderr: '',
      closeSignal: null,
      exitSignal: null,
      error: null,
    };

    let closed = false;

    const cmd = spawn(command, args, options);

    cmd.stdout.on('data', (data): void => {
      if (!closed) {
        res.stdout += data.toString();
      }
    });

    cmd.stderr.on('data', (data): void => {
      res.stderr += data.toString();
    });

    cmd.on('error', (err): void => {
      res.error = err;
      reject(res);
    });

    cmd.on('close', (code, signal): void => {
      closed = true;
      res.closeCode = code;
      res.closeSignal = signal;
    });

    cmd.on('exit', (code, signal): void => {
      res.exitCode = code;
      res.exitSignal = signal;
      resolve(res);
    });
  });

export default exec;
