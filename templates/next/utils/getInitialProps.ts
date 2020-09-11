import Cookies from 'universal-cookie';
import getId from 'shortid';
import { NextPageContext } from 'next';

import { publicRuntimeConfig } from '../settings';

const { cookieKey, userTokenKey } = publicRuntimeConfig;

const getInitialProps = (
  ctx: NextPageContext,
): { sessionId: string; userToken: string | null } => {
  const header = ctx.req?.headers?.cookie;
  const cookies = new Cookies(header);
  let sessionId = cookies.get(cookieKey);

  if (!sessionId) {
    sessionId = getId();
    if (ctx.res) {
      ctx.res.setHeader(
        'Set-Cookie',
        `${encodeURIComponent(cookieKey)}=${encodeURIComponent(sessionId)}; Secure`,
      );
    } else {
      cookies.set(cookieKey, sessionId, { secure: true });
    }
  }

  return {
    sessionId,
    userToken: cookies.get(userTokenKey) || null,
  };
};

export default getInitialProps;
