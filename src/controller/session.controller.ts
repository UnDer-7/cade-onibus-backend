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
      const canLogin = await this.canLogin(user);
      if (canLogin) {
        return res.status(400).json(canLogin);
      }

      return res.status(200).json(JWTService.createToken(user))
    } catch (e) {
      console.trace(e);
      return res.status(500).json(e);
    }
  };

  private canLogin = async (user: User): Promise<string | undefined> => {
    try {
      const userFound = await UserSchema.findOne({ email: user.email });
      if (!userFound) {
        return Messages.NOT_FOUND;
      }

      if (!(await userFound.compareHash(user))) {
        return Messages.INVALID_PASSWORD;
      }
    } catch (e) {
      console.trace(e);
      return Messages.UNEXPECTED_ERROR;
    }
  }
}

export default new SessionController();
