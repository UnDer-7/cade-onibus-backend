import { Router } from 'express';
import UserController from './controller/user.controller';
import { AuthenticationMiddleware } from './middleware/authentication.middleware';
import SessionController from './controller/session.controller';
const routes = Router();

const userURLs = '/api/users';
const sessionURLs = '/api/session';

// ----Authorization NOT REQUIRED----
routes.post(userURLs, UserController.createUser);
routes.post(`${sessionURLs}/email`, SessionController.loginWithEmail);

routes.use(AuthenticationMiddleware.authenticationMiddleware);

// ----Authorization REQUIRED----
// USER'S RESOURCE
routes.get(`${ userURLs }/:id`, UserController.getUser);

export default routes;
