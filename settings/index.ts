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
 * Projects folders inside templates
 */
export const templatesFolders: {[project: string]: string} = {
  next: 'next',
  expo: 'expo',
};

/**
 * Name of environment variable for Mongo URL
 */
export const mongoUrlParam = 'MONGO_URL';


/**
 * Name of environment variable for Mongo DB name
 */
export const mongoDbNameParam = 'DB_NAME';

export const secretKey = process.env.SECRET_KEY || 'a2r_secret_key';
