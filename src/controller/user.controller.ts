// tslint:disable-next-line
const uuid = require('uuid/v1');

import { Request, Response } from 'express';
import { User } from '../model/user.model';
import { ConvertToEntity } from '../util/convert-to-entity.util';
import UserSchema from '../schema/user.schema';
import { Messages } from '../util/messages.util';
import { Category } from '../model/category.model';

class UserController {

  public updateDatabase = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const foundG = await  UserSchema.find();
      // @ts-ignore
      // newUser.categories = [];

      let newUser;
      for (const item of foundG) {
        // @ts-ignore
        const allBuss = item.bus;

        newUser = Object.assign({} as User, {
          // @ts-ignore
          google_id: item.google_id,
          // @ts-ignore
          name: item.name,
          // @ts-ignore
          email: item.email,
          // @ts-ignore
          password: item.password,
          // @ts-ignore
          createdAt: item.createdAt,
          // @ts-ignore
          _id: item._id,
        });

        const category = [{
          uuid: uuid(),
          title: 'Todos',
          cardColor: 4285547775,
          buses: allBuss,
        } as Category];

        newUser.categories = category;

        await UserSchema.updateOne(
          { _id: newUser._id},
          newUser,
          { new: true, safe: false, strict: false},
        );
      }
      this.moveAllBusToNewModel();
      return res.json(newUser);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public createUser = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);

    try {
      if (await UserSchema.findOne({ email: user.email })) {
        return res.status(400).json(Messages.RESOURCE_EXISTS);
      }

      user.categories = [];
      const category: Category = {
        uuid: uuid(),
        title: 'Todos',
        cardColor: 4285547775,
        buses: [],
      };
      user.categories.push(category);

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

      const tmp = Object.assign({}, {
        google_id: user.google_id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        _id: user._id,
        categories: user.categories,
      });

      return res.status(200).json(tmp);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  private moveAllBusToNewModel = async (): Promise<void> => {
    const foundG = await UserSchema.find();

    for (const item of foundG) {
      const allBus = item.categories[0].buses;
      // @ts-ignore
      const newBuses = [];

      // @ts-ignore
      // tslint:disable-next-line:no-shadowed-variable
      allBus.forEach(item => {
        const newBus = {
          numero: item.numero,
          descricao: item.descricao,
          // @ts-ignore
          tarifa: item.faixaTarifaria.tarifa,
        };
        newBuses.push(newBus);
      });

      // @ts-ignore
      item.categories[0].buses = newBuses;
      await UserSchema.updateOne(
        { _id: item._id},
        item,
        { new: true, safe: false, strict: false},
      )
    }
  };

}

export default new UserController();
