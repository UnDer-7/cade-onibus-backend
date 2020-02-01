import { Request, Response, NextFunction } from 'express';
import { Messages } from '../util/messages.util';
import { JWTService } from '../util/jwt.util';
import { JsonWebTokenError } from 'jsonwebtoken';

class AuthenticationMiddleware {
  public authenticationMiddleware =
    async (req: Request, res: Response, next: NextFunction): Promise<NextFunction | Response | void> => {
      const headers = req.headers.authorization;
      const isHeadersValid =  this.isHeadersValid(headers);

      if (isHeadersValid) {
        return res.status(401).json(isHeadersValid)
      }

      const token = headers!.split(' ')[1];

      try {
        const decoded = await JWTService.verifyLoginToken(token);
        const isTokenValid = JWTService.isLoginTokenValid(decoded);

        if (isTokenValid) {
          return res.status(401).json(isTokenValid)
        }

        // @ts-ignore
        req.userEmail = decoded.email;

        return next()
      } catch (e) {
        switch (e instanceof JsonWebTokenError) {
          case e.message === 'jwt malformed':
            return res.status(400).json(Messages.INVALID_TOKEN);
          case e.message === 'invalid signature':
            return res.status(400).json(Messages.INVALID_TOKEN);
          default:
            console.trace(e);
            return res.status(500).json(Messages.UNEXPECTED_ERROR);
        }
      }
    };

  private isHeadersValid = (headers: string | undefined): string | undefined => {
    if (!headers) {
      return Messages.TOKEN_NOT_FOUND
    }

    const [type]: string[] = headers.split(' ');

    if (type !== 'Bearer') {
      return Messages.INVALID_TOKEN;
    }
  };
}

export default new AuthenticationMiddleware();
