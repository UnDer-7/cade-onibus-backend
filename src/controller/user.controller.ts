// tslint:disable-next-line
import { Bus } from '../model/bus.model';

// tslint:disable-next-line:no-var-requires
const uuid = require('uuid/v1');

import { Request, Response } from 'express';
import { User } from '../model/user.model';
import { ConvertToEntity } from '../util/convert-to-entity.util';
import UserSchema from '../schema/user.schema';
import { Messages } from '../util/messages.util';
import { Category, Bus as BusCategory } from '../model/category.model';
import { flatten, uniqBy } from 'lodash';

class UserController {

  /**
   * @deprecated
   */
  public updateDatabase = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const foundG = await  UserSchema.find();

      let newUser;
      for (const item of foundG) {
        // @ts-ignore
        const allBuss = this.factoryNewBus(item.bus);
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

        newUser.categories = [{
          uuid: uuid(),
          title: 'Todos',
          cardColor: 4285547775,
          buses: allBuss ? allBuss : [],
        }] as Category[];

        newUser.categories.push({
          uuid: uuid(),
          title: 'Cadê Ônibus Web',
          cardColor: 4293467747,
          buses: allBuss ? allBuss : [],
        });

        await UserSchema.updateOne(
          { _id: newUser._id},
          newUser,
          { new: true, safe: false, strict: false},
        );
      }
      return res.json(newUser);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public  associateEmail = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);

    try {
      const userFound = await UserSchema.findOne({ email: user.email });
      if (!userFound) {
        console.log('Usuario nao encontrado');
        return res.status(404).json(Messages.NOT_FOUND);
      }

      if (!await userFound.compareHash(user)) {
        return res.status(400).json(Messages.INVALID_CREDENTIALS);
      }

      userFound.google_id = user.google_id;
      const userSaved = await userFound.save();
      return res.status(200).json(userSaved);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public  associateAccount = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);

    try {
      const userFound = await UserSchema.findOne({ email: user.email });
      if (!userFound) {
        console.log('Usuario nao encontrado');
        return res.status(404).json(Messages.NOT_FOUND);
      }

      if (!userFound.google_id) {
        console.log('Usuario nao tem GoogleID');
        return res.status(404).json(Messages.INVALID_CREDENTIALS);
      }

      if (userFound.google_id !== user.google_id) {
        console.log('Usuario informou um GoogleID diferente');
        return res.status(404).json(Messages.INVALID_CREDENTIALS);
      }

      if (userFound.google_id && userFound.password) {
        return res.status(404).json(Messages.RESOURCE_EXISTS);
      }

      userFound.password = user.password;
      const userCreated = await userFound.save();
      return res.status(200).json(userCreated);

    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public createUser = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);
    const { type } = req.query;

    try {
      const userFound = await UserSchema.findOne({ email: user.email });

      if (userFound) {
        if (type === 'email') {
          if (userFound.password) {
            return res.status(400).json(Messages.RESOURCE_EXISTS);
          }
          return res.status(400).json(Messages.CAN_CREATE);
        } else {
          if (userFound.google_id) {
            return res.status(400).json(Messages.RESOURCE_EXISTS)
          }
          return res.status(400).json(Messages.CAN_CREATE);
        }
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

  public createUserWeb = async (req: Request, res: Response): Promise<Response> => {
    const user = ConvertToEntity.convert<User>(req.body);
    // @ts-ignore
    const buses: BusCategory[] = user.bus.map((item) => {
      return {
        numero: item.numero,
        descricao: item.descricao,
        tarifa: item.faixaTarifaria!.tarifa,
      } as BusCategory;
    });

    try {
      if (await UserSchema.findOne( { email: user.email })) {
        return res.status(400).json(Messages.RESOURCE_EXISTS);
      }

      user.categories = [];
      const todos: Category = {
        uuid: uuid(),
        title: 'Todos',
        cardColor: 4285547775,
        buses,
      };
      const web: Category = {
        uuid: uuid(),
        title: 'Cadê Ônibus Web',
        cardColor: 4293467747,
        buses,
      };
      user.categories.push(todos, web);

      const userCreate = await UserSchema.create(user);
      return res.status(201).json(userCreate);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public removeBus = async (req: Request, res: Response): Promise<Response> => {
    const linha = req.params.linha;
    // @ts-ignore
    const email = req.userEmail;

    try {
      let userFound = await UserSchema.findOne({ email })
        .select('-password') as User;

      const index = userFound.categories.findIndex((item) => item.title === 'Cadê Ônibus Web');

      if (index < 0) {
        return res.status(400).json(Messages.NOT_FOUND);
      }
      const hasBus: boolean = !!userFound.categories[index].buses.find((item) => item.numero === linha);
      if (!hasBus) {
        return res.status(400).json(Messages.NOT_FOUND);
      }

      userFound.categories[index].buses
        = userFound.categories[index].buses.filter((item) => item.numero !== linha);

      userFound = this.updateTodos(userFound);

      const userUpdated = await UserSchema.findOneAndUpdate(
        { email: userFound.email },
        userFound,
        { new: true },
      );

      // @ts-ignore
      return res.status(200).json(this.getOnlyTodo(userUpdated));
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public addBus = async (req: Request, res: Response): Promise<Response> => {
    const busesOld: Bus[] = req.body;
    const buses: BusCategory[] = busesOld.map((item) => {
      return {
        numero: item.numero,
        descricao: item.descricao,
        tarifa: item.faixaTarifaria!.tarifa,
      } as BusCategory;
    });

    // @ts-ignore
    const email = req.userEmail;
    try {
      let userFound = await UserSchema.findOne( { email })
        .select('-password') as User;

      const containsWeb: boolean = !!userFound!.categories.find((item) => item.title === 'Cadê Ônibus Web');
      const allBuses = userFound.categories.find((item) => item.title === 'Todos')!.buses;
      buses.forEach((item) => allBuses.push({
        numero: item.numero,
        descricao: item.descricao,
        tarifa: item.tarifa,
      }));

      if (!containsWeb) {
        userFound.categories.push({
          uuid: uuid(),
          title: 'Cadê Ônibus Web',
          cardColor: 4293467747,
          buses: allBuses,
        });
      } else {
        const index = userFound.categories.findIndex((item) => item.title === 'Cadê Ônibus Web');
        buses.forEach((item) => userFound.categories[index].buses.push(item));
      }

      userFound = this.updateTodos(userFound);
      const userUpdate = await UserSchema.findOneAndUpdate(
        { email: userFound.email },
        userFound,
        { new: true },
      );

      // @ts-ignore
      return res.status(200).json(this.getOnlyTodo(userUpdate));
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

  public getTodos = async (req: Request, res: Response): Promise<Response> => {
    try {
      // @ts-ignore
      const email = req.userEmail;
      const user = await UserSchema.findOne({ email });
      // @ts-ignore
      const newUser = this.getOnlyTodo(user);
      return res.status(200).json(newUser);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  private factoryNewBus = (buses: Bus[]): BusCategory[] => {
    return buses.map((item) => {
      return {
        numero: item.numero,
        descricao: item.descricao,
        tarifa: item.faixaTarifaria!.tarifa,
      } as BusCategory;
    });
  };

  private updateTodos = (user: User): User => {
    const allCategory = user.categories.filter((item) => item.title !== 'Todos');
    const allBuses = allCategory.map((item) => item.buses);
    const flattedBuses = flatten(allBuses);
    const todos = uniqBy(flattedBuses, 'numero');
    user.categories.forEach((item) => {
      if (item.title === 'Todos') {
        item.buses = todos;
        return;
      }
    });
    return user;
  };

  private getOnlyTodo = (user: User): any => {
    const buses = user!.categories.find((item) => item.title = 'Todos')!.buses;
    return {
      google_id: user!.google_id,
      name: user!.name,
      email: user!.email,
      password: user!.password,
      bus: buses,
    };
  }
}

export default new UserController();
