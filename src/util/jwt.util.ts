import { User } from '../model/user.model';
import * as jwt from 'jsonwebtoken';

import { promisify } from 'util';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Token } from '../model/token.model';
import { Messages } from './messages.util';
import CryptoUtil from './crypto.util';

export class JWTService {
  public static createAuthToken(user: User): string {
    const payload = Object.assign({}, {
      email: user.email,
      createdAt: user.createdAt,
    });

    // @ts-ignore
    return jwt.sign(payload, process.env.APP_SECRET, {
      expiresIn: '20 days', algorithm: 'HS512',
    })
  }

  public static createForgotPasswordToken(user: User): string {
    const payloadUser = {
      email: user.email,
      id: user._id,
      name: user.name,
    };

    const payload = CryptoUtil.encrypt(JSON.stringify(payloadUser));
    // @ts-ignore
    return jwt.sign({ payload }, process.env.FORGOT_PASSWORD_SECRET, {
      expiresIn: '1h', algorithm: 'HS512',
    });
  }

  public static async verifyToken(token: string): Promise<Token | JsonWebTokenError> {
    try {
      // @ts-ignore
      return await promisify(jwt.verify)(token, process.env.APP_SECRET);
    } catch (e) {
      return e
    }
  }

  public static isTokenValid = (decode: Token | JsonWebTokenError): string | undefined => {
    if (decode instanceof JsonWebTokenError && decode.message === 'invalid signature') {
      return Messages.INVALID_TOKEN;
    }
    if (decode.hasOwnProperty('email')) {
      return;
    }
    throw decode;
  };
}
