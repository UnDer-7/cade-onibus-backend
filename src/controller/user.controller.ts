import { Request, Response } from 'express';
import { User } from '../model/user.model';
import { ConvertToEntity } from '../util/convert-to-entity.util';
import UserSchema from '../schema/user.schema';
import { Messages } from '../util/messages.util';

class UserController {

  public createUser = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);

    try {
      if (await UserSchema.findOne({ email: user.email })) {
        return res.status(400).json(Messages.RESOURCE_EXISTS);
      }

      const userCreated = await UserSchema.create(user);
      return res.status(201).json(userCreated);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public updateUser = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);

    try {
      const userUpdated = await UserSchema.findOneAndUpdate(
        { _id: user._id },
        user,
        { new: true },
      );
      return res.status(200).json(userUpdated);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public getUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.params.email) {
        return res.status(400).json(Messages.NO_EMAIL);
      }

      const user = await UserSchema.findOne({ email: req.params.email });

      if (!user) {
        return res.status(404).json(Messages.NOT_FOUND);
      }

      delete user.password;

      return res.status(200).json(user);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };
}

export default new UserController();
