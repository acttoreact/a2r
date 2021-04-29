const getHeadersProvider = (): string => `import { GetServerSidePropsContext } from 'next';
import Cookies from 'universal-cookie';

import { cookieKey, userTokenKey, refererKey } from '../../../config/settings';

const getHeader = (ctx: GetServerSidePropsContext): string => {
  const res = [];
  const setCookieHeader = ctx.res.getHeader('Set-Cookie');
  if (setCookieHeader) {
    if (typeof setCookieHeader === 'object') {
      res.push(...(setCookieHeader as string[]));
    }
    res.push(setCookieHeader as string);
  }
  if (ctx.req.headers.cookie) {
    res.push(ctx.req.headers.cookie);
  }
  return res.join('; ');
};

const getHeaders = (ctx?: GetServerSidePropsContext): { Cookie?: string } => {
  if (!ctx || !ctx.req || !ctx.res) {
    return {};
  }
  const header = getHeader(ctx);
  if (!header) {
    return {};
  }
  const cookies = new Cookies(header);
  const sessionId: string = cookies.get(cookieKey);
  let cookie = \`\${cookieKey}=\${sessionId}\`;
  const userToken = cookies.get(userTokenKey);
  if (userToken) {
    cookie = \`\${cookie}; \${userTokenKey}=\${userToken}\`;
  }
  const refererCookie: string = cookies.get(refererKey);
  if (refererCookie) {
    cookie = \`\${cookie}; \${refererKey}=\${refererCookie}\`;
  }
  return { 'Cookie': cookie };
};

export default getHeaders;`;

export default getHeadersProvider;
