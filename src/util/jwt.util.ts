import { User } from '../model/user.model';
import * as jwt from 'jsonwebtoken';
import { JsonWebTokenError } from 'jsonwebtoken';

import { promisify } from 'util';
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
      expiresIn: '30 days', algorithm: 'HS512',
    })
  }

  public static createForgotPasswordToken(user: User): string {
    const payloadUser = {
      email: user.email,
      id: user._id,
    };

    const payload = CryptoUtil.encrypt(JSON.stringify(payloadUser));
    // @ts-ignore
    return jwt.sign({ payload }, process.env.FORGOT_PASSWORD_SECRET, {
      expiresIn: '10h', algorithm: 'HS512',
    });
  }

  public static async verifyForgotPasswordToken(token: string): Promise<any | JsonWebTokenError> {
    return this.verifyToken(token, process.env.FORGOT_PASSWORD_SECRET);
  }

  public static async verifyLoginToken(token: string): Promise<Token | JsonWebTokenError> {
    return this.verifyToken(token, process.env.APP_SECRET);
  }

  public static isLoginTokenValid = (decode: Token | JsonWebTokenError): string | undefined => {
    return JWTService.isTokenValid(decode, 'email');
  };

  public static isForgotPasswordTokenValid = (decode: Token | JsonWebTokenError): string | undefined => {
    return JWTService.isTokenValid(decode, 'payload');
  };

  private static isTokenValid = (decode: Token | JsonWebTokenError, property: string): string | undefined => {
    if (decode instanceof JsonWebTokenError && decode.message === 'invalid signature') {
      return Messages.INVALID_TOKEN;
    }
    if (decode.hasOwnProperty(property)) {
      return;
    }
    throw decode;
  };

  private static async verifyToken(token: string, secret: string | undefined): Promise<Token | JsonWebTokenError> {
    // @ts-ignore
    return await promisify(jwt.verify)(token, secret);
  }
}
