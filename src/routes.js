'use strict'

const express = require('express')
const handle = require('express-async-handler')
const validate = require('express-validation')
const routes = express.Router()

const controllers = require('./app/controllers')
const validators = require('./app/validators')

const authMiddleware = require('./app/middlewares/auth')

const rootUrl = '/api'

routes.post(`${rootUrl}/login`, validate(validators.LoginValidator), handle(controllers.SessionController.login))
routes.post(`${rootUrl}/users`, validate(validators.UserValidator), handle(controllers.UserController.createUser))

routes.use(authMiddleware)

/**
 *  USER'S ROUTES
 */
routes.put(`${rootUrl}/users/:id`, validate(validators.UserUpdateValidator), handle(controllers.UserController.updateUser))
routes.get(`${rootUrl}/users`, handle(controllers.UserController.getAllUser))
routes.get(`${rootUrl}/users/:id`, handle(controllers.UserController.getUser))
routes.delete(`${rootUrl}/users/:id`, handle(controllers.UserController.deleteUser))

/**
 *  USERLOCATION'S ROUTES
 */
routes.post(`${rootUrl}/userlocations`, validate(validators.UserLocationValidator), handle(controllers.UserLocationController.createUserLocation))
routes.put(`${rootUrl}/userlocations/:id`, validate(validators.UserLocationValidator), handle(controllers.UserLocationController.updateUserLocation))
routes.get(`${rootUrl}/userlocations`, handle(controllers.UserLocationController.getAllUserLocation))
routes.get(`${rootUrl}/userlocations/:id`, handle(controllers.UserLocationController.getUserLocation))
routes.delete(`${rootUrl}/userlocations/:id`, handle(controllers.UserLocationController.deleteUserLocation))

// Do not remove this cometary
// ===== lazy-backend hook =====

module.exports = routes
