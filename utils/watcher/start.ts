import path from 'path';
import { out } from '@a2r/telemetry';
import { ensureDir, exists } from '@a2r/fs';

import { OnReady, WatcherOptions } from '../../model/watcher';

import { fullPath, log } from '../colors';
import Validator from './runtimeValidator';
import modelFileValidation from './modelFileValidation';
import onModelValidation from './onModelValidation';
import onError from './onError';
import watchFolder from './watchFolder';
import apiFileValidation from './apiFileValidation';
import onApiValidation from './onApiValidation';

import { serverPath, modelPath, apiPath, proxyPath } from '../../settings';
import watchFolders from './watchFolders';

const start = async (
  mainProjectPath: string,
  devServerInternalPath: string,
  additionalFolders: string[],
): Promise<void> => {
  const mainServerPath = path.resolve(mainProjectPath, serverPath);
  const pathExists = await exists(serverPath);
  if (!pathExists) {
    const error = `Provided server path doesn't exist: ${fullPath(serverPath)}`;
    out.error(error);
    throw new Error(error);
  }

  const mainProxyPath = path.resolve(devServerInternalPath, proxyPath);
  await ensureDir(mainProxyPath);

  const modelSourcePath = path.resolve(mainServerPath, modelPath);
  const onModelWatcherReady: OnReady = async (watcher, targetPath): Promise<void> => {
    log(`Model watcher running at path: ${fullPath(modelSourcePath)}`);
    const validator = new Validator(
      modelFileValidation,
      onModelValidation,
      targetPath,
      mainProxyPath,
    );
    watcher.on('all', (eventName, eventPath): void => {
      validator.addFileToQueue({ targetPath: eventPath, type: eventName });
    });
  };
  const modelWatcherOptions: WatcherOptions = {
    onError,
    targetPath: modelSourcePath,
    onReady: onModelWatcherReady,
  };
  await watchFolder(modelWatcherOptions);

  const apiSourcePath = path.resolve(mainServerPath, apiPath);

  const onApiWatcherReady: OnReady = async (watcher, targetPath): Promise<void> => {
    log(`API watcher running at path: ${fullPath(apiSourcePath)}`);
    const validator = new Validator(apiFileValidation, onApiValidation, targetPath, mainProxyPath);
    watcher.on('all', (eventName, eventPath): void => {
      validator.addFileToQueue({ targetPath: eventPath, type: eventName });
    });
  };
  const apiWatcherOptions: WatcherOptions = {
    onError,
    targetPath: apiSourcePath,
    onReady: onApiWatcherReady,
  };

  await watchFolder(apiWatcherOptions);

  await watchFolders(additionalFolders, mainServerPath);
};

export default start;
