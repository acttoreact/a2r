import exec from '../tools/exec';

const getLatestVersion = async (): Promise<string> => {
  const res = await exec('npm', ['show', 'a2r', 'version']);
  return res.stdout.trim();
};

export default getLatestVersion;
