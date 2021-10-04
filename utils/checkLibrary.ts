import { out } from '@a2r/telemetry';

import exec from '../tools/exec';

const checkLibrary = async (library: string): Promise<boolean> => {
  try {
    const { stdout: checkOut } = await exec(library, ['-v']);
    const { stdout: exitCode } = await exec('echo', ['$?']);
    const check = exitCode !== '0';
    if (!check) {
      out.error(checkOut);
    }
    return check;
  } catch (ex) {
    out.error(
      `Error checking library: ${(ex as Error).message}\n${
        (ex as Error).stack
      }`,
    );
    return false;
  }
};

export default checkLibrary;
