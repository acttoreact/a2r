import path from 'path';
import { readDir, ensureDir, emptyFolder, exists } from '@a2r/fs';

import copyFilesFromTemplate from '../../utils/copyFilesFromTemplate';

import { templatesPath, mainTemplateFolder } from '../../settings';

const mockTemplates = path.resolve(__dirname, '../mocks/templates');

beforeAll(async (): Promise<void> => {
  await ensureDir(mockTemplates);
});

test('Template contents must include .gitignore and similar files', async (): Promise<void> => {
  const a2rTemplatePath = path.resolve(__dirname, '../../', templatesPath, 'a2r');
  const files = await readDir(a2rTemplatePath);
  expect(files).toContain('gitignore');
});

test('Copying files from template should copy .gitignore', async (): Promise<void> => {
  await copyFilesFromTemplate(mainTemplateFolder, mockTemplates);
  const gitIgnorePath = path.resolve(mockTemplates, '.gitignore');
  expect(await exists(gitIgnorePath)).toBe(true);
});

afterAll(async (): Promise<void> => {
  await emptyFolder(mockTemplates);
});