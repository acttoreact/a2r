import App, { AppInitialProps, AppContext } from 'next/app';

import getSessionId from '../utils/getSessionId';

class A2RApp extends App {
  public static async getInitialProps(appContext: AppContext): Promise<AppInitialProps> {
    const { ctx } = appContext;
    const sessionId = getSessionId(ctx);

    return {
      pageProps: {
        sessionId,
      },
    };
  }
}

export default A2RApp;
