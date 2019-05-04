import { Request, Response, NextFunction } from 'express';
import { Messages } from '../util/messages.util';
import { JWTService } from '../util/jwt.util';
import { Token } from '../model/token.model';
import { JsonWebTokenError } from 'jsonwebtoken';

export class AuthenticationMiddleware {
  public static authenticationMiddleware =
    async (req: Request, res: Response, next: NextFunction): Promise<NextFunction | Response | void> => {
      const headers = req.headers.authorization;
      const isHeadersValid =  AuthenticationMiddleware.isHeadersValid(headers);

      if (isHeadersValid) {
        return res.status(401).json(isHeadersValid)
      }

      const token = headers!.split(' ')[1];

      try {
        const decoded = await JWTService.verifyToken(token);
        const isTokenValid = AuthenticationMiddleware.isTokenValid(decoded);

        if (isTokenValid) {
          return res.status(401).json(isTokenValid)
        }

        // @ts-ignore
        req.userEmail = decoded.email;

        return next()
      } catch (e) {
        console.trace(e);
        res.status(500).json(e);
      }
    };

  private static isTokenValid = (decode: Token | JsonWebTokenError): string | undefined => {
    if (decode instanceof JsonWebTokenError && decode.message === 'invalid signature') {
      return Messages.INVALID_TOKEN;
    }
    if (decode.hasOwnProperty('email')) {
      return;
    }
    throw decode;
  };

  private static isHeadersValid = (headers: string | undefined): string | undefined => {
    if (!headers) {
      return Messages.TOKEN_NOT_FOUND
    }

    const [type]: string[] = headers.split(' ');

    if (type !== 'Bearer') {
      return Messages.INVALID_TOKEN;
    }
  };

}
