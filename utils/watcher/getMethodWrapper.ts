const getMethodWrapper =
  (): string => `const methodWrapper = (method: string, ...args: any[]): Promise<any> => {
  // console.log('methodWrapper', method, [...args]);
  if (!isClient()) {
    const apiPath = method.split('.').join('/');
    const params = args.slice();
    const ctx = (params.pop() as unknown) as GetServerSidePropsContext<ParsedUrlQuery>;
    let hostName = ctx?.req?.headers?.host;
    const protocol = domain && domain.includes('localhost') ? 'http' : 'https';
    if (hostName?.includes('localhost') || domain) {
      hostName = domain;
    }
    const basicEndpoint = \`\${protocol}://\${hostName}\${basePath}/a2r/\${apiPath}\`;
    const clusterEndpoint = \`http://\${clusterUrl}/a2r/\${apiPath}\`;
    const url = clusterUrl ? clusterEndpoint : basicEndpoint;
    // console.log('on server side, calling REST API method', url);
    return new Promise<any>((resolve, reject): void => {
      const agent = new https.Agent({
        rejectUnauthorized: !ignoreUnauthorized,
      })
      axios({
        method: 'post',
        url,
        httpsAgent: agent,
        headers: { ...getHeaders(ctx), a2rHost: hostName || '' },
        data: {
          params,
        },
      })
        .then((response) => {
          resolve(response.data);
        })
        .catch(reject);
    });
  }
  return new Promise<any>((resolve, reject): void => {
    // console.log('socket connected?', socket && socket.connected);
    if (socket) {
      if (socket.disconnected) {
        // console.log('socket disconnected, connecting');
        socket.connect();
      }
      const id = generateId();
      // console.log('id', id);
      socket.on(id, (res: SocketMessage): void => {
        socket.off(id);
        if (res.o) {
          resolve(res.d);
        } else {
          const error = new Error(res.e);
          error.stack = res.s;
          reject(error);
        }
      });

      const call: MethodCall = {
        method,
        id,
        params: args,
      };
      
      // console.log('before emit, call:', call);
      socket.emit('*', call);
    } else {
      console.error('No client socket available!');
      reject(new Error('No client socket available!'));
    }
  });
};`;

export default getMethodWrapper;
