// tslint:disable-next-line
const uuid = require('uuid/v1');

import { Request, Response } from 'express';
import { User } from '../model/user.model';
import { ConvertToEntity } from '../util/convert-to-entity.util';
import UserSchema from '../schema/user.schema';
import { Messages } from '../util/messages.util';
import { Category } from '../model/category.model';
import { Bus } from '../model/bus.model';

class UserController {

  public updateDatabase = async (req: Request, res: Response): Promise<Response> => {
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

  public addCategory = async (req: Request, res: Response): Promise<Response> => {
    const newCategory = ConvertToEntity.convert<Category>(req.body);
    const userId = req.headers.authorization;

    console.log('REQUEST TO UPDATE CATEGORY: \n', newCategory);

    try {
      const userFound = await UserSchema
        .findOne({ email: 'mateus7532@gmail.com'}) // todo Colocar ID
        .select('-password') as User;

      const canAdd = this.canAddCategory(userFound.categories, newCategory);
      if (!canAdd) {
        return res.status(400).json(Messages.RESOURCE_EXISTS);
      }

      const todosCategory = userFound.categories.find(cat => cat.title === 'Todos');
      const diffFromTodos = newCategory!.buses
        .filter(
          item => !todosCategory!.buses
            .find(item2 => item2.numero === item.numero),
        );

      diffFromTodos
        .forEach(diff => {
          // @ts-ignore
          userFound.categories.find(todos => todos.title === 'Todos').buses.push(diff);
        });

      newCategory.uuid = uuid();
      userFound.categories.push(newCategory);

      const userUpdated = await UserSchema.findOneAndUpdate(
        { email: 'mateus7532@gmail.com' },
        userFound,
        { new: true },
      );
      return res.status(201).json(userUpdated!.categories);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public updateCategory = async (req: Request, res: Response): Promise<Response> => {
    const newCategory = ConvertToEntity.convert<Category>(req.body);
    const userId = req.headers.authorization;

    try {
      const userFound = await UserSchema
        .findOne({email: 'mateus7532@gmail.com'})// todo COLOCAR ID
        .select('-password') as User;

      const canUpdate = this.canUpdateCategory(userFound.categories, newCategory);
      if (!canUpdate) {
        return res.status(400).json(Messages.RESOURCE_EXISTS);
      }

      // REMOVE FROM TODOS
      const oldBuses = userFound.categories.find(item => item.uuid === newCategory.uuid)!.buses;
      const busesRemoved = oldBuses.filter(item => !newCategory.buses.find(tmp => tmp.numero === item.numero));

      // update category with new one
      const newCategoryIndex = userFound.categories.findIndex(item => item.uuid === newCategory.uuid);
      userFound.categories[newCategoryIndex] = newCategory;
      // ----

      busesRemoved.forEach(item => {
        const canRemove = this.canRemoveFromAll(userFound, item);
        if (canRemove) {
          const todosIndex = userFound.categories.findIndex(catPre => catPre.title === 'Todos');
          const busIndex = userFound.categories[todosIndex].buses.findIndex(busPre => busPre.numero === item.numero);
          const removed = userFound.categories[todosIndex].buses.splice(busIndex, 1);
        }
      });
      // -------

      const todosCategory = userFound.categories.find(item => item.title === 'Todos');
      const diffFromTodos = newCategory!.buses
        .filter(
          item => !todosCategory!.buses
            .find(item2 => item2.numero === item.numero),
        );

      diffFromTodos
      // @ts-ignore
        .forEach(diff => userFound.categories.find(todos => todos.title === 'Todos').buses.push(diff));

      const oldCategory = userFound.categories.find(item => item.uuid === newCategory.uuid);
      const update = Object.assign(oldCategory, newCategory);
      const index = userFound.categories.findIndex(item => item.uuid === update.uuid);
      userFound.categories[index] = update;

      const userUpdated = await UserSchema.findOneAndUpdate(
        { email: userFound.email },
        userFound,
        { new: true },
      );
      return res.json(userUpdated!.categories).status(200);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
  };

  public deleteBus = async (req: Request, res: Response): Promise<Response> => {
    const bus = ConvertToEntity.convert<Bus>(req.body);
    const user = req.headers.authorization;
    const reqUuid = req.params.uuid;

    try {
      // delete from the specified category
      const userFound = await UserSchema.findOne({ email: 'mateus7532@gmail.com'}).select('-password') as User;
      const categoryIndex = userFound.categories.findIndex(item => item.uuid === reqUuid);
      userFound.categories[categoryIndex].buses =
        userFound.categories[categoryIndex].buses.filter(item => item.numero !== bus.numero);
      // ------------

      // delete from todos if necessary
      const canRemove = this.canRemoveFromAll(userFound, bus);
      if (canRemove) {
        const catIndex = userFound.categories.findIndex(item => item.title === 'Todos');
        const busIndex = userFound.categories[catIndex].buses.findIndex(item => item.numero === bus.numero);
        userFound.categories[catIndex].buses.splice(busIndex, 1);
      }
      // ----------

      const userUpdated = await UserSchema.findOneAndUpdate(
        { email: userFound.email },
        userFound,
        { new: true },
      );

      return res.json(userUpdated!.categories).status(200);
    } catch (e) {
      console.trace(e);
      return res.status(500).json(Messages.UNEXPECTED_ERROR);
    }
    return res.status(200)
  };

  public deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    const user = req.headers.authorization;
    const categoryUuid = req.params.uuid;

    try {
      const userFound = await UserSchema.findOne({email: 'mateus7532@gmail.com'}).select('-password') as User;
      const categoryIndex = userFound.categories.findIndex(item => item.uuid === categoryUuid);
      const busesRemoved = userFound.categories[categoryIndex].buses;
      userFound.categories.splice(categoryIndex, 1);

      busesRemoved.forEach(item => {
        const canRemove = this.canRemoveFromAll(userFound, item);
        if (canRemove) {
          const todosBuses = userFound.categories
            .find(cat => cat.title === 'Todos')!
            .buses.filter(bus => bus.numero !== item.numero);

          userFound.categories
            .find(todos => todos.title === 'Todos')!
            .buses = todosBuses;
        }

      });

      const userUpdated = await UserSchema.findOneAndUpdate(
        { email: userFound.email },
        userFound,
        { new: true },
      );

      return res.status(200).json(userUpdated!.categories);
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

  private canAddCategory = (categories: Category[], newCategory: Category): boolean => {
    return !categories.find(item => item.title.toUpperCase() === newCategory.title.toUpperCase());
  };

  private canUpdateCategory = (categories: Category[], newCategory: Category): boolean => {
    const categoryFound = categories
      .find(item => item.title.toUpperCase() === newCategory.title.toUpperCase());

    if (!categoryFound) return true;

    // tslint:disable-next-line:triple-equals
    return categoryFound!.uuid === newCategory.uuid;
  };

  private canRemoveFromAll = (userFound: User, bustoSearch: Bus): boolean => {
    return !userFound.categories
      .filter(item => item.title !== 'Todos')
      .map(item => item.buses)
      .find(item => item
        .find(lol => lol.numero === bustoSearch.numero),
      );
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
