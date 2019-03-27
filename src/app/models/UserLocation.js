'use strict'

const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')

const UserLocationSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
  },
  sequencial: {
    type: Number,
    required: true,
  },
  cords: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

UserLocationSchema.plugin(paginate)
module.exports = mongoose.model('UserLocation', UserLocationSchema)
