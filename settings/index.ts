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
