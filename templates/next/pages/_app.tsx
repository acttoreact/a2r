/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/naming-convention */
import App, { AppInitialProps, AppContext } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import React, { ComponentClass } from 'react';

import getInitialProps from '../utils/getInitialProps';

import { loginUrl } from '../settings';

interface CustomComponent extends ComponentClass {
  getLayout?: () => React.ReactNode;
  isPrivate?: boolean;
}

class A2RApp extends App {
  public static async getInitialProps(appContext: AppContext): Promise<AppInitialProps> {
    const { ctx, Component } = appContext;
    const { sessionId, userToken } = getInitialProps(ctx);

    if ((Component as CustomComponent).isPrivate && !userToken) {
      const { res } = ctx;
      if (res) {
        res.writeHead(302, { Location: loginUrl });
        res.end();
      } else {
        Router.push(loginUrl);
      }
    }

    return {
      pageProps: {
        sessionId,
        userToken,
      },
    };
  }

  public render(): JSX.Element {
    const { Component, pageProps } = this.props;

    const getLayout =
      (Component as CustomComponent).getLayout ||
      ((page: React.ReactNode): React.ReactNode => page);

    const MemoComponent = React.memo(Component);

    return (
      <>
        <Head>
          <title>A2R Project</title>
        </Head>
        {getLayout(<MemoComponent {...pageProps} />)}
      </>
    );
  }
}

export default A2RApp;
