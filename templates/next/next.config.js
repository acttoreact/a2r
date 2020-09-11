/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

module.exports = {
  publicRuntimeConfig: {
    cookieKey: process.env.COOKIE_KEY,
    userTokenKey: process.env.USER_TOKEN_KEY,
  },
};
