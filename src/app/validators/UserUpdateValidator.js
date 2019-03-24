'use strict'

const Joi = require('joi')

module.exports = {
  body: {
    name: Joi.string().required(),
    email: Joi.string().required().min(5).max(55).email(),
    onibus: Joi.array()
  }
}
