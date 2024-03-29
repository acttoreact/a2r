import ts from 'typescript';
import path from 'path';
import { out } from '@a2r/telemetry';
import { getFilesRecursively, writeFile } from '@a2r/fs';

import {
  APIStructure,
  ModuleInfo,
  ApiNamespace,
  GroupedImports,
  ImportClause,
} from '../../model/api';

import getModuleInfo from './getModuleInfo';
import getGroupedModelImports from './getGroupedModelImports';
import getProxyMethod from './getProxyMethod';
import updateApiObject from './updateApiObject';
import getApiObjectText from './getApiObject';
import getMethodWrapper from './getMethodWrapper';
import getSocketProvider from './getSocketProvider';
import getIsClientContent from './getIsClientContent';
import getAuthHandler from './getAuthHandler';
import getHeadersProvider from './getHeadersProvider';

export const api: APIStructure = {};

/**
 * Gets external needed imports
 */
const getExternalImports = (): GroupedImports[] => [
  { path: `'axios'`, def: 'axios' },
  { path: `'https'`, def: 'https' },
  { path: `'shortid'`, def: 'generateId' },
  { path: `'next'`, named: ['GetServerSidePropsContext'] },
  { path: `'querystring'`, named: ['ParsedUrlQuery'] },
];

/**
 * Gets internal needed imports
 */
const getInternalImports = (): GroupedImports[] => [
  { path: `'./socket'`, def: 'socket', named: ['MethodCall', 'SocketMessage'] },
  { path: `'./isClient'`, def: 'isClient' },
  { path: `'./getHeaders'`, def: 'getHeaders' },
  {
    path: `'../../../config/settings'`,
    named: ['basePath', 'domain', 'clusterUrl', 'ignoreUnauthorized'],
  },
];

/**
 * Gets model imports text
 * @param groupedModelImports Grouped model imports (by path)
 */
const getImports = (groupedModelImports: GroupedImports[]): string =>
  groupedModelImports
    .map(
      ({ def, named, path: fromPath }) =>
        `import ${def ? `${def}${named && named.length ? ', ' : ''}` : ''}${
          named && named.length ? `{ ${named.join(', ')} }` : ''
        } from ${fromPath};`,
    )
    .join('\n');

/**
 * Gets docs text
 * @param jsDoc `jsDoc` property from `JSDocContainer`
 */
const getDocs = (jsDoc: ts.JSDoc[]): string => jsDoc[0].getFullText();

const getValidMethodName = (methodName: string, existing: { [key: string]: boolean }): string => {
  let res = methodName;
  let i = 2;
  while (existing[res]) {
    res = `${methodName}${i}`;
    i++;
  }
  return res;
};

/**
 * Build API proxy and needed files
 * @param apiSourcePath API source path
 * @param proxyTargetPath Proxy target path, where generated files will be written
 */
export const build = async (apiSourcePath: string, proxyTargetPath: string): Promise<void> => {
  const files = await getFilesRecursively(apiSourcePath, ['.ts']);
  const proxyIndexPath = path.resolve(proxyTargetPath, 'index.ts');
  const socketFilePath = path.resolve(proxyTargetPath, 'socket.ts');
  const authFilePath = path.resolve(proxyTargetPath, 'auth.ts');
  const isClientFilePath = path.resolve(proxyTargetPath, 'isClient.ts');
  const getHeadersPath = path.resolve(proxyTargetPath, 'getHeaders.ts');

  const modulesInfo: (ModuleInfo | null)[] = await Promise.all(
    files.map((file) => getModuleInfo(file, apiSourcePath)),
  );

  let apiObject: ApiNamespace = {
    key: 'api',
    namespaces: [],
    methods: [],
  };

  const imports: ImportClause[] = [];
  const allUsedTypes: string[] = [];
  const methods: string[] = [];
  const methodsNames: { [key: string]: boolean } = {};

  for (let i = 0, l = modulesInfo.length; i < l; i++) {
    const {
      mainMethodDocs,
      mainMethodName,
      mainMethodParamNodes,
      mainMethodReturnTypeInfo,
      modelImports,
      usedTypes,
      keys,
    } = modulesInfo[i]!;
    const doc = getDocs(mainMethodDocs!.jsDoc as ts.JSDoc[]);
    const methodName = getValidMethodName(mainMethodName, methodsNames);
    methodsNames[methodName] = true;
    const method = getProxyMethod(
      keys.join('.'),
      methodName,
      mainMethodParamNodes,
      mainMethodReturnTypeInfo,
    );
    imports.push(...modelImports);
    allUsedTypes.push(...usedTypes);
    methods.push([doc, method].join('\n'));
    apiObject = updateApiObject(apiObject, keys, methodName);
  }

  const initialImports: GroupedImports[] = [...getExternalImports(), ...getInternalImports()];
  const groupedImports = getGroupedModelImports(initialImports, imports, allUsedTypes);

  await writeFile(socketFilePath, getSocketProvider());
  await writeFile(isClientFilePath, getIsClientContent());
  await writeFile(getHeadersPath, getHeadersProvider());
  await writeFile(
    proxyIndexPath,
    [
      getImports(groupedImports),
      getMethodWrapper(),
      ...methods,
      getApiObjectText(apiObject),
      'export default api;\n',
    ]
      .filter((s) => !!s)
      .join('\n\n'),
  );
  await writeFile(authFilePath, getAuthHandler());
  out.verbose('API Proxy built');
};
