import { neededLibraries } from '../settings';
import checkLibrary from './checkLibrary';
import { log } from './colors';

const checkLibraries = async (libraries: string[]): Promise<boolean> => {
  const libs = libraries.slice();
  const lib = libs.shift();
  if (!lib) {
    return true;
  }
  const check = await checkLibrary(lib);
  if (!check) {
    return false;
  }
  return checkLibraries(libs);
};

const checkDependencies = async (libraries = neededLibraries): Promise<boolean> => {
  log('Checking dependencies...');
  return checkLibraries(libraries);
};

export default checkDependencies;
