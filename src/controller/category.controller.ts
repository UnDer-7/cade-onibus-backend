// tslint:disable-next-line
const uuid = require('uuid/v1');

import { flatten, uniqBy } from 'lodash';
import { Request, Response } from 'express';
import { ConvertToEntity } from '../util/convert-to-entity.util';
import { Category, Bus } from '../model/category.model';
import UserSchema from '../schema/user.schema';
import { User } from '../model/user.model';
import { Messages } from '../util/messages.util';

class CategoryController {

  public addCategory = async (req: Request, res: Response): Promise<Response> => {
    const newCategory = ConvertToEntity.convert<Category>(req.body);
    // @ts-ignore
    const user = req.userEmail;

    try {
      let userFound = await UserSchema
        .findOne({ email: user})
        .select('-password') as User;

      const canAdd = this.canAddCategory(userFound.categories, newCategory);
      if (!canAdd) {
        return res.status(400).json(Messages.RESOURCE_EXISTS);
      }

      newCategory.uuid = uuid();
      userFound.categories.push(newCategory);
      userFound = this.updateTodos(userFound);

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
      let userFound = await UserSchema
        .findOne({email: user})
        .select('-password') as User;

      const canUpdate = this.canUpdateCategory(userFound.categories, newCategory);
      if (!canUpdate) {
        return res.status(400).json(Messages.RESOURCE_EXISTS);
      }

      const categoryIndex = userFound.categories.findIndex((item) => item.uuid === newCategory.uuid);
      userFound.categories[categoryIndex] = newCategory;

      userFound = this.updateTodos(userFound);

      let userUpdated = await UserSchema.findOneAndUpdate(
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
      let userFound = await UserSchema.findOne({ email: user}).select('-password') as User;

      // delete from the specified category
      const categoryIndex = userFound.categories.findIndex(item => item.uuid === reqUuid);
      userFound.categories[categoryIndex].buses =
        userFound.categories[categoryIndex].buses.filter(item => item.numero !== bus.numero);
      // ------------

      userFound = this.updateTodos(userFound);
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

  public deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    // @ts-ignore
    const user = req.userEmail;
    const categoryUuid = req.query.uuid;

    try {
      let userFound = await UserSchema.findOne({email: user}).select('-password') as User;
      userFound.categories = userFound.categories.filter((item) => item.uuid !== categoryUuid);

      userFound = this.updateTodos(userFound);
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
  }

}

export default new CategoryController();
