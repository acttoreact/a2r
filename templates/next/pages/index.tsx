import React, { useEffect } from 'react';
import Head from 'next/head';

import api from 'api';

import { Data } from 'model/data';

export default (): JSX.Element => {
  const data: Data = { info: 'info' };
  useEffect(() => {
    console.log(data);
    api.ping().then((res) => {
      console.log('Ping result: ', res);
    });
  }, []);
  return (
    <React.Fragment>
      <Head>
        <title>Hello BinPar!</title>
        <link rel="stylesheet" type="text/css" href="/styles.css" />
      </Head>
      <h1>Hello BinPar</h1>
    </React.Fragment>
  );
};
