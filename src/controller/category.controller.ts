// tslint:disable-next-line
const uuid = require('uuid/v1');

import { Request, Response } from 'express';
import { ConvertToEntity } from '../util/convert-to-entity.util';
import { Category } from '../model/category.model';
import UserSchema from '../schema/user.schema';
import { User } from '../model/user.model';
import { Messages } from '../util/messages.util';
import { Bus } from '../model/bus.model';

class CategoryController {

  public addCategory = async (req: Request, res: Response): Promise<Response> => {
    const newCategory = ConvertToEntity.convert<Category>(req.body);
    // @ts-ignore
    const user = req.userEmail;

    console.log('REQUEST TO UPDATE CATEGORY: \n', newCategory);

    try {
      const userFound = await UserSchema
        .findOne({ email: user}) // todo Colocar ID
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
        { email: user },
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
    // @ts-ignore
    const user = req.userEmail;

    try {
      const userFound = await UserSchema
        .findOne({email: user})// todo COLOCAR ID
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
          userFound.categories[todosIndex].buses.splice(busIndex, 1);
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
    // @ts-ignore
    const user = req.userEmail;
    const reqUuid = req.params.uuid;

    try {
      // delete from the specified category
      const userFound = await UserSchema.findOne({ email: user}).select('-password') as User;
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
    // @ts-ignore
    const user = req.userEmail;
    const categoryUuid = req.query.uuid;
    console.log('URL ORIGIN', req.originalUrl);

    try {
      const userFound = await UserSchema.findOne({email: user}).select('-password') as User;
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

  private canRemoveFromAll = (userFound: User, bustoSearch: Bus): boolean => {
    return !userFound.categories
      .filter(item => item.title !== 'Todos')
      .map(item => item.buses)
      .find(item => item
        .find(lol => lol.numero === bustoSearch.numero),
      );
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
}

export default new CategoryController();
