'use strict'

const Joi = require('joi')

module.exports = {
  body: {
    email: Joi.string().required().min(5).max(100).email(),
    userId: Joi.string().required()
  }
}
