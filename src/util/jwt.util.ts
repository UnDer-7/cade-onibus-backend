import { User } from '../model/user.model';
import * as jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Token } from '../model/token.model';

export class JWTService {
  public static createToken(user: User): string {
    const payload = Object.assign({}, {
      email: user.email,
      createdAt: user.createdAt,
    });

    // @ts-ignore
    return jwt.sign(payload, process.env.APP_SECRET, {
      expiresIn: '10 days', algorithm: 'HS512',
    })
  }

  public static async verifyToken(token: string): Promise<Token | JsonWebTokenError> {
    try {
      // @ts-ignore
      return await promisify(jwt.verify)(token, process.env.APP_SECRET);
    } catch (e) {
      return e
    }
  }
}
