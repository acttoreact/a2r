import Cookies from 'universal-cookie';
import getId from 'shortid';
import { NextPageContext } from 'next';

import { cookieKey, userTokenKey } from '../config/settings';

const getInitialProps = (
  ctx: NextPageContext,
): { sessionId: string; userToken: string | null } => {
  const header = ctx.req?.headers?.cookie;
  const cookies = new Cookies(header);
  let sessionId = cookies.get(cookieKey);

  if (!sessionId) {
    sessionId = getId();
    if (ctx.res) {
      const protocol = ctx.req?.headers.referer.split('://').shift();
      ctx.res.setHeader(
        'Set-Cookie',
        `${encodeURIComponent(cookieKey)}=${encodeURIComponent(sessionId)}${
          protocol === 'https' ? '; Secure' : ''
        }`,
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
