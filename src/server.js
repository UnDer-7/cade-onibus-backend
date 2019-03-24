'use strict'

require('dotenv').config()

const express = require('express')
const validate = require('express-validation')
const logger = require('morgan')
const Youch = require('youch')
const cors = require('cors')
const mongoose = require('mongoose')

class App {
  constructor () {
    this.express = express()

    this.database()
    this.setCors()
    this.middleware()
    this.routes()
    this.exception()
  }

  database () {
    try {
      mongoose.connect(process.env.DB_URL, {
        useCreateIndex: true,
        useNewUrlParser: true
      })
      mongoose.set('debug', true)
    } catch (e) {
      console.trace(e)
    }
  }

  setCors () {
    this.express.use(cors())
  }

  middleware () {
    this.express.use(logger('dev'))
    this.express.disable('x-powered-by')
    this.express.use(express.json())
  }

  routes () {
    this.express.use(require('./routes'))
  }

  exception () {
    this.express.use(async (err, req, res, next) => {
      if (err instanceof validate.ValidationError) {
        return res.status(err.status).json(err)
      }

      if (process.env.NODE_ENV !== 'production') {
        const youch = new Youch(err)
        return res.json(await youch.toJSON())
      }

      return res.status(err.status || 500).json({ error: 'Internal Server Error' })
    })
  }
}

module.exports = new App().express
