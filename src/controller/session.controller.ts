import { Request, Response } from 'express';
import { User } from '../model/user.model';
import { ConvertToEntity } from '../util/convert-to-entity.util';
import UserSchema from '../schema/user.schema';
import { Messages } from '../util/messages.util';
import { JWTService } from '../util/jwt.util';
import { Token } from '../model/token.model';
import ForgotPasswordService from '../service/email/forgot-password.email.service';
import { JsonWebTokenError } from 'jsonwebtoken';
import { TokenForgotPassword } from '../model/token-forgot-password.model';

class SessionController {
  public loginWithEmail = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);

    try {
      const canLogin = await this.canEmailPasswordLogin(user, res);
      if (canLogin) {
        return canLogin
      }

      return res.status(200).json(JWTService.createAuthToken(user))
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public forgotPasswordPassword = async (req: Request, res: Response): Promise<Response> => {
    const email = req?.body?.email;

    try {
      const userFound = await UserSchema.findOne({ email });
      if (!userFound) {
        return res.status(404).json(Messages.NOT_FOUND);
      }
      const jwt = JWTService.createForgotPasswordToken(userFound);

      ForgotPasswordService.sendForgotPassword(email, jwt)
        .then(resEmail => console.log('Email enviado com sucesso! - ', resEmail))
        .catch(err => console.log('Erro ao enviar email! - ', err));

      return res.status(200);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public isForgotPasswordTokenValid = async (req: Request, res: Response): Promise<Response> => {
    const token = req.body.token;
    try {
      const decoded = await JWTService.verifyForgotPasswordToken(token);
      const isTokenValid = JWTService.isForgotPasswordTokenValid(decoded);
      if (isTokenValid) {
        return res.status(400).json(isTokenValid)
      }

      const tokenForgotPassword = new TokenForgotPassword(decoded, token);
      // @ts-ignore
      if (tokenForgotPassword.exp <= Date.now()) {
        return res.status(400).json(Messages.TOKEN_EXPIRED)
      }

      return res.status(200).json(tokenForgotPassword)
    } catch (e) {
      switch (e instanceof JsonWebTokenError) {
        case e.message === 'jwt malformed':
          console.log(e.message);
          return res.status(400).json(Messages.INVALID_TOKEN);
        case e.message === 'invalid signature':
          console.log(e.message);
          return res.status(400).json(Messages.INVALID_TOKEN);
        default:
          console.trace(e);
          return res.status(500).json(Messages.UNEXPECTED_ERROR);
      }
    }
  };

  public loginWithGoogle = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);

    try {
      const canLogin = await this.canGoogleLogin(user, res);
      if (canLogin) return canLogin;

      return res.status(200).json(JWTService.createAuthToken(user));
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const token = req.body.token;
    try {
      const decoded = await JWTService.verifyLoginToken(token);
      const isTokenValid = JWTService.isLoginTokenValid(decoded);

      if (isTokenValid) {
        return res.status(401).json(isTokenValid)
      }

      const { email } = decoded as Token;

      // @ts-ignore
      const user: User = {
        email,
      };

      return res.status(200).json(JWTService.createAuthToken(user));
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

  private canEmailPasswordLogin = async (user: User, res: Response): Promise<Response | undefined> => {
    try {
      const userFound = await UserSchema.findOne({ email: user.email });
      if (!userFound) {
        return res.status(404).json(Messages.NOT_FOUND);
      }

      if (!userFound.password) {
        return res.status(400).json(Messages.EMAIL_USED_ON_GOOGLE);
      }

      if (!(await userFound.compareHash(user))) {
        return res.status(400).json(Messages.INVALID_CREDENTIALS);
      }
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  private canGoogleLogin = async (user: User, res: Response): Promise<Response | undefined> => {
    try {
      const userFound = await UserSchema.findOne({ email: user.email });
      if (!userFound) {
        return res.status(404).json(Messages.NOT_FOUND);
      }

      if (userFound.google_id !== user.google_id) {
        if (userFound.password && !userFound.google_id) {
          return res.status(400).json(Messages.CAN_CREATE);
        }
        return res.status(400).json(Messages.INVALID_CREDENTIALS);
      }
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };
}

export default new SessionController();
