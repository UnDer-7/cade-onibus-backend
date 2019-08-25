import { Router } from 'express';

import UserController from './controller/user.controller';
import AuthenticationMiddleware from './middleware/authentication.middleware';
import SessionController from './controller/session.controller';
import CategoryController from './controller/category.controller';

const routes = Router();

const userURLs = '/api/users';
const categoryURLs = '/api/categories';
const sessionURLs = '/api/session';

// ----Authorization NOT REQUIRED----
routes.get(`${ userURLs }/update-database`, UserController.updateDatabase);

routes.post(userURLs, UserController.createUser);
routes.post(`${sessionURLs}/refresh`, SessionController.refreshToken);
routes.post(`${sessionURLs}/email`, SessionController.loginWithEmail);
routes.post(`${sessionURLs}/google`, SessionController.loginWithGoogle);

routes.use(AuthenticationMiddleware.authenticationMiddleware);

// ----Authorization REQUIRED----
// USER'S RESOURCE
routes.get(`${ userURLs }/:email`, UserController.getUser);
routes.put(`${ userURLs }`, UserController.updateUser);

// CATEGORY'S RESOURCE
routes.post(`${ categoryURLs}`, CategoryController.addCategory);
routes.put(`${ categoryURLs }`, CategoryController.updateCategory);
routes.delete(`${ categoryURLs }`, CategoryController.deleteCategory);
routes.delete(`${ categoryURLs }/bus/:uuid`, CategoryController.deleteBus);

export default routes;
