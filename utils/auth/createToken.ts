import { sign } from 'jsonwebtoken';

import { secretKey } from '../../settings';

import { UserTokenInfo } from '../../model/auth';

const createToken = (info: UserTokenInfo) => {
  return sign(info, secretKey);
};

export default createToken;
