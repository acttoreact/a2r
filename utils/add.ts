import path from 'path';
import execa from 'execa';
import { out } from '@a2r/telemetry';
import { exists, readFile, writeFile } from '@a2r/fs';

import {
  Command,
  PackageJson,
  RunningCommand,
  SolutionInfo,
  TsConfig,
} from '../model';

import getProjectPath from './getProjectPath';
import getCleanProjectName from './getCleanProjectName';
import copyFilesFromTemplate from './copyFilesFromTemplate';
import { log, terminalCommand, fullPath, framework } from './colors';
import { addProject } from './settings';
import getLatestVersion from './getLatestVersion';
import mergePackageJson from './mergePackageJson';

import {
  templatesFolders,
  defaultDockerImage,
  defaultDockerWorkDir,
} from '../settings';

/**
 * Adds component project to solution
 * @param project Project type
 * @param destination Destination folder
 */
const add = async (
  info: RunningCommand
): Promise<void> => {
  const { options } = info;
  const { type: project, dest: destination, base: baseProjectPath } = options;
  const templateFolder = templatesFolders[project];
  if (templateFolder) {
    if (!destination) {
      out.warn(`Destination folder has not been provided, using ${project}`);
    }
    const projectPath = await getProjectPath();
    const destFolder = destination || project;
    const destPath = path.resolve(projectPath, destFolder);
    let proceed = true;
    if (await exists(destPath)) {
      out.error(
        `Can't add project. Folder ${fullPath(destPath)} already exists`,
      );
      proceed = false;
    }
    const baseProject = path.resolve(projectPath, baseProjectPath || '');
    if (proceed && project === 'electron') {
      if (!baseProjectPath) {
        out.error('Electron projects needs a base project path (Next project)');
        proceed = false;
      }
      if (proceed && !(await exists(baseProject))) {
        out.error(
          `Provided base project path (${fullPath(
            baseProject,
          )}) for Electron project doesn't exist`,
        );
        proceed = false;
      }
    }
    if (proceed) {
      log(`Adding ${project} project at ${fullPath(destPath)}...`);
      await copyFilesFromTemplate(project, destPath);
      const cleanProjectName = await getCleanProjectName(projectPath);
      const packageJsonPath = path.resolve(destPath, 'package.json');
      const packageJsonContent = await readFile(packageJsonPath, 'utf8');
      const packageJsonInfo = JSON.parse(packageJsonContent) as PackageJson;
      packageJsonInfo.name = destFolder;
      if (project === 'electron') {
        packageJsonInfo.productName = destFolder;
      }
      await writeFile(
        packageJsonPath,
        JSON.stringify(packageJsonInfo, null, 2),
      );
      if (project === 'electron') {
        await mergePackageJson(
          packageJsonPath,
          path.resolve(baseProject, 'package.json'),
        );
        const tsConfigPath = path.resolve(
          destPath,
          'renderer',
          'tsconfig.json',
        );
        const tsConfigContent = await readFile(tsConfigPath, 'utf8');
        const tsConfigInfo = JSON.parse(tsConfigContent) as TsConfig;
        tsConfigInfo.compilerOptions.rootDirs = [
          './',
          `../../${baseProjectPath}`,
        ];
        await writeFile(tsConfigPath, JSON.stringify(tsConfigInfo, null, 2));
      }
      log(`Running ${terminalCommand(`npm install`)}...`);
      await execa('npm', ['install'], {
        stdout: process.stdout,
        stderr: process.stderr,
        cwd: destPath,
      });
      const latestVersion = await getLatestVersion();
      log(`Installing ${framework} as a project dev dependency...`);
      await execa('npm', ['install', `a2r@${latestVersion}`, '--save-dev'], {
        stdout: process.stdout,
        stderr: process.stderr,
        cwd: destPath,
      });
      const projectInfo: SolutionInfo['projects'][0] = {
        type: project,
        path: destFolder,
      };
      if (project === 'next') {
        projectInfo.dockerBase = defaultDockerImage;
        projectInfo.dockerName = `${cleanProjectName}-${destFolder}`;
        projectInfo.dockerWorkingDir = defaultDockerWorkDir;
      }
      if (project === 'electron') {
        projectInfo.baseProject = baseProjectPath;
      }
      await addProject(projectInfo);
      log(`Project created at ${fullPath(destPath)}`);
    }
  } else {
    out.error(
      `Unknown option: ${project}. Available options are ${Object.keys(
        templatesFolders,
      )
        .map((s) => `'${s}'`)
        .join(', ')}`,
    );
  }
};

const command: Command = {
  run: add,
  name: 'add',
  description: `Creates project in solution ('next', 'expo' or 'electron') at desired destination folder`,
  args: [
    {
      name: 'type',
      typeLabel: '{underline next|electron}',
      description: `Project type. Current available options are: 'next' and 'electron'. Support for 'expo' is coming soon`,
      type: String,
      required: true,
    },
    {
      name: 'dest',
      typeLabel: '{underline folder name}',
      description: 'Project destination. Folder name where new project will be created at',
      type: String,
      required: true,
    },
    {
      name: 'base',
      typeLabel: '{underline folder name}',
      description: 'Project base. Required for Electron project. Folder name containing Next.js project to use as base',
      type: String,
    }
  ],
};

export default command;
