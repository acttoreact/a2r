import { readFile, writeFile } from '@a2r/fs';

import { PackageJson } from '../model';

const mergePackageJson = async (
  basePath: string,
  projectPackagePath: string,
): Promise<void> => {
  const baseJsonContent = await readFile(basePath, 'utf8');
  const baseJsonInfo = JSON.parse(baseJsonContent) as Required<PackageJson>;
  const projectJsonContent = await readFile(projectPackagePath, 'utf8');
  const projectJsonInfo = JSON.parse(
    projectJsonContent,
  ) as Required<PackageJson>;
  const { dependencies, devDependencies } = baseJsonInfo;
  const finalDependencies = Object.entries(projectJsonInfo.dependencies).reduce(
    (t, [key, value]) => ({
      [key]: value,
      ...t,
    }),
    dependencies,
  );
  const finalDevDependencies = Object.entries(
    projectJsonInfo.devDependencies,
  ).reduce(
    (t, [key, value]) => ({
      [key]: value,
      ...t,
    }),
    devDependencies,
  );
  await writeFile(basePath, JSON.stringify({
    ...baseJsonInfo,
    dependencies: finalDependencies,
    devDependencies: finalDevDependencies,
  }));
};

export default mergePackageJson;
