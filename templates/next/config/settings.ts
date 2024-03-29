import getConfig from 'next/config';

export const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

const {
  refererKey: configRefererKey,
  cookieKey: configCookieKey,
  userTokenKey: configUserTokenKey,
  domain: configDomain,
  loginUrl: configLogin,
  basePath: configBasePath,
  ignoreUnauthorized: configIgnoreUnauthorized,
} = publicRuntimeConfig;

const { clusterUrl: configClusterUrl } = serverRuntimeConfig;

export const loginUrl: string = configLogin || '/login';
export const refererKey: string = configRefererKey || 'a2r_referer';
export const cookieKey: string = configCookieKey || 'readgarden_sessionId';
export const userTokenKey: string =
  configUserTokenKey || 'readgarden_userToken';
export const domain: string = configDomain;
export const basePath: string =
  (process.env.NODE_ENV === 'production' && configBasePath) || '';
export const clusterUrl: string = configClusterUrl;
export const ignoreUnauthorized: boolean = configIgnoreUnauthorized;
