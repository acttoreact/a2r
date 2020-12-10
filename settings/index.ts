/**
 * Needed libraries to check before init
 */
export const neededLibraries = ['node', 'docker'];

/**
 * Path containing projects templates
 */
export const templatesPath = 'templates';

/**
 * Docker Hub repository for A2R images
 */
export const dockerHubRepository = 'act2react';

/**
 * Main template folder (for init command)
 */
export const mainTemplateFolder = 'a2r';

/**
 * Server path
 */
export const serverPath = 'server';

/**
 * Default api path inside main target path
 */
export const apiPath = 'api';

/**
 * Default model path inside main target path
 */
export const modelPath = 'model';

/**
 * Default proxy target path, where watcher will generate proxy for API and Model
 */
export const proxyPath = 'proxy';

/**
 * Internal dev server path
 */
export const devServerPath = 'dev-server';

/**
 * Server path at server docker
 */
export const dockerServerPath = '/usr/src/app/server';

/**
 * Default docker working directory
 */
export const defaultDockerWorkDir = '/usr/src/app';

/**
 * A2R internal path in projects
 */
export const projectsInternalPath = '.a2r';

/**
 * Default socket path
 */
export const socketPath = '/ws';

/**
 * Default cookie key
 */
export const defaultCookieKey = 'a2r_sessionId';

/**
 * Default user token key
 */
export const defaultUserTokenKey = 'a2r_userToken';

/**
 * Default referer key
 */
export const defaultRefererKey = 'a2r_referer';

/**
 * Default docker image
 */
export const defaultDockerImage = 'node:12-alpine';

/**
 * Projects folders inside templates
 */
export const templatesFolders: {[project: string]: string} = {
  next: 'next',
  expo: 'expo',
  electron: 'electron',
};

/**
 * Name of environment variable for Mongo URL
 */
export const mongoUrlParam = 'MONGO_URL';


/**
 * Name of environment variable for Mongo DB name
 */
export const mongoDbNameParam = 'DB_NAME';

/**
 * Key for cookie key
 */
export const cookieKeyKey = 'COOKIE_KEY';

/**
 * Key for userToken key
 */
export const userTokenKeyKey = 'USER_TOKEN_KEY';
