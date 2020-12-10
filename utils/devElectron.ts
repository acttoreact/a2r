import path from 'path';
import execa from 'execa';
import {
  copyFile,
  ensureDir,
  exists,
  mkDir,
  readDir,
  rimraf,
  unlink,
} from '@a2r/fs';

import { ProjectInfo } from '../model';

import getProjectPath from './getProjectPath';
import getFilesRecursively from '../tools/getFilesRecursively';
import copyProjectContentsToPath from './copyProjectContentsToPath';
import { log, terminalCommand } from './colors';

import { projectsInternalPath } from '../settings';

const devElectron = async (project: ProjectInfo): Promise<void> => {
  const mainProjectPath = await getProjectPath();
  const a2rInternalPath = path.resolve(mainProjectPath, projectsInternalPath);
  const currentProjectPath = path.resolve(mainProjectPath, project.path);
  const baseProjectPath = path.resolve(mainProjectPath, project.baseProject!);
  const projectInternalPath = path.resolve(
    mainProjectPath,
    a2rInternalPath,
    project.path,
  );
  const internalSrcPath = path.resolve(projectInternalPath, 'src');
  const internalRendererPath = path.resolve(internalSrcPath, 'renderer');

  if (await exists(internalSrcPath)) {
    const srcFiles = await readDir(internalSrcPath, { withFileTypes: true });
    await Promise.all(
      srcFiles.map(async (content) => {
        if (content.name !== 'node_modules') {
          const fullPath = path.resolve(internalSrcPath, content.name);
          if (content.isFile()) {
            await unlink(fullPath);
          } else {
            await rimraf(fullPath);
          }
        }
      }),
    );
  }

  await ensureDir(projectInternalPath);
  await ensureDir(internalSrcPath);
  await ensureDir(internalRendererPath);

  const pathsToIgnore = ['node_modules'];
  const filesToIgnore = ['package.json', 'package-lock.json'];
  const electronRendererPath = path.resolve(currentProjectPath, 'renderer');

  const electronFiles = await getFilesRecursively(
    electronRendererPath,
    pathsToIgnore,
    filesToIgnore,
  );
  const nextFiles = await getFilesRecursively(
    baseProjectPath,
    pathsToIgnore,
    filesToIgnore,
  );

  const electronFilesPaths = new Set<string>();

  for (let i = 0, l = electronFiles.length; i < l; i++) {
    electronFilesPaths.add(
      path.relative(electronRendererPath, electronFiles[i]),
    );
  }

  await copyProjectContentsToPath(currentProjectPath, internalSrcPath);
  await Promise.all(
    nextFiles.map(async (filePath) => {
      const relativePath = path.relative(baseProjectPath, filePath);
      if (!electronFilesPaths.has(relativePath)) {
        const destPath = path.resolve(internalRendererPath, relativePath);
        const dirPath = path.dirname(destPath);
        const check = await exists(dirPath);
        if (!check) {
          await mkDir(dirPath, { recursive: true });
        }
        await copyFile(filePath, destPath);
      }
    }),
  );

  const baseNextFiles = await readDir(baseProjectPath, { withFileTypes: true });
  const filesToIgnoreSet = new Set(filesToIgnore);
  await Promise.all(
    baseNextFiles.map(async (content) => {
      if (content.isFile()) {
        if (!filesToIgnoreSet.has(content.name)) {
          const fullPath = path.resolve(baseProjectPath, content.name);
          const destPath = path.resolve(internalRendererPath, content.name);
          if (!(await exists(destPath))) {
            await copyFile(fullPath, destPath);
          }
        }
      }
    }),
  );

  const nodeModulesPath = path.resolve(internalSrcPath, 'node_modules');
  if (!(await exists(nodeModulesPath))) {
    log(`No modules installed, running ${terminalCommand('npm install')}`);
    await execa('npm', ['install'], {
      cwd: internalSrcPath,
      stdout: process.stdout,
      stderr: process.stderr,
    });
  }
  log('Running electron app');
  await execa('npm', ['run', 'dev'], {
    cwd: internalSrcPath,
    stdout: process.stdout,
    stderr: process.stderr,
  });
};

export default devElectron;
