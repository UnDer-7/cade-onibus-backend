import { Request, Response } from 'express';
import { User } from '../model/user.model';
import { ConvertToEntity } from '../util/convert-to-entity.util';
import UserSchema from '../schema/user.schema';
import { Messages } from '../util/messages.util';
import { JWTService } from '../util/jwt.util';

class SessionController {
  public loginWithEmail = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);

    try {
      const canLogin = await this.canEmailPasswordLogin(user, res);
      if (canLogin) {
        return res.status(400).json(canLogin);
      }

      return res.status(200).json(JWTService.createToken(user))
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public loginWithGoogle = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);

    try {
      const canLogin = await this.canGoogleLogin(user, res);
      if (canLogin) return canLogin;

      return res.status(200).json(JWTService.createToken(user));
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  private canEmailPasswordLogin = async (user: User, res: Response): Promise<Response | undefined> => {
    try {
      const userFound = await UserSchema.findOne({ email: user.email });
      if (!userFound) {
        return res.status(404).json(Messages.NOT_FOUND);
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
        return res.status(400).json(Messages.INVALID_CREDENTIALS);
      }
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };
}

export default new SessionController();
