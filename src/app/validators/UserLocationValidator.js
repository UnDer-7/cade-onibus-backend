'use strict'

const Joi = require('joi')

module.exports = {
  body: {
    cords: Joi.object().required(),
    numero: Joi.string().required(),
    sequencial: Joi.number().required()
  }
}
