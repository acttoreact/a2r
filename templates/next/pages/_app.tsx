import React, { createContext } from 'react';
import App, { AppInitialProps, AppContext } from 'next/app';

import getSessionId from '../utils/getSessionId';

export const SessionContext = createContext<string>('');

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

  public render(): JSX.Element {
    const {
      Component,
      pageProps: { sessionId, ...props },
    } = this.props;

    return (
      <SessionContext.Provider value={sessionId}>
        <Component {...props} />
      </SessionContext.Provider>
    );
  }
}

export default A2RApp;
