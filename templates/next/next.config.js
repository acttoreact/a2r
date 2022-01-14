module.exports = {
  publicRuntimeConfig: {
    domain: process.env.DOMAIN,
    cookieKey: process.env.COOKIE_KEY,
    userTokenKey: process.env.USER_TOKEN_KEY,
    refererKey: process.env.REFERER_KEY,
    basePath: process.env.BASE_PATH,
    loginUrl: process.env.LOGIN_URL,
  },
  serverRuntimeConfig: {
    clusterUrl: process.env.CLUSTER_URL,
  },
};
