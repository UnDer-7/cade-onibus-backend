import { Router } from 'express';
import UserController from './controller/user.controller';
import { AuthenticationMiddleware } from './middleware/authentication.middleware';
import SessionController from './controller/session.controller';
const routes = Router();

const userURLs = '/api/users';
const sessionURLs = '/api/session';

// ----Authorization NOT REQUIRED----
routes.post(userURLs, UserController.createUser);
routes.post(`${sessionURLs}/refresh`, SessionController.refreshToken);
routes.post(`${sessionURLs}/email`, SessionController.loginWithEmail);
routes.post(`${sessionURLs}/google`, SessionController.loginWithGoogle);

routes.use(AuthenticationMiddleware.authenticationMiddleware);

// ----Authorization REQUIRED----
// USER'S RESOURCE
routes.get(`${ userURLs }/:email`, UserController.getUser);
routes.put(`${ userURLs }`, UserController.updateUser);

export default routes;
