import { out } from '@a2r/telemetry';

import exec from '../tools/exec';

const checkLibrary = async (library: string): Promise<boolean> => {
  try {
    const { out: checkOut } = await exec(library, ['-v']);
    const { out: exitCode } = await exec('echo', ['$?']);
    const check = exitCode !== '0';
    if (!check) {
      out.error(checkOut);
    }
    return check;
  } catch (ex) {
    out.error(`Error checking library: ${ex.message}\n${ex.stack}`);
    return false;
  }
};

export default checkLibrary;
