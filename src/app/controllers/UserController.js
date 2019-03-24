'use strict'

const User = require('../models/User')

class UserController {
  async createUser (req, res) {
    try {
      if (await User.findOne({ email: req.body.email })) {
        return res.status(400).json('User already exists')
      }

      const user = await User.create(req.body)
      return res.status(201).json(user)
    } catch (e) {
      console.trace(e)
      return res.status('500').json({ error: e })
    }
  }

  async updateUser (req, res) {
    try {
      const user = await User.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true })

      const userRes = Object.assign({}, {
        _id: user._id,
        email: user.email,
        name: user.name,
        onibus: user.onibus
      })

      return res.status(200).json(userRes)
    } catch (e) {
      if (e.codeName === 'DuplicateKey') {
        return res.status(400).json('User already exists')
      }
      console.trace(e)
      return res.status(500).json(e)
    }
  }

  async getAllUser (req, res) {
    try {
      const user = await User.paginate({}, {
        page: req.query.page || 1,
        limit: req.query.page || 25,
        sort: req.query.sort || '-createdAt'
      })
      return res.status(200).json({ user })
    } catch (e) {
      console.trace(e)
      return res.status(500).json(e)
    }
  }

  async getUser (req, res) {
    try {
      const user = await User.findById(req.params.id)

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const userRes = Object.assign({}, {
        _id: user._id,
        email: user.email,
        name: user.name,
        onibus: user.onibus
      })

      return res.status(200).json(userRes)
    } catch (e) {
      console.trace(e)
      res.status(500).json(e)
    }
  }

  async deleteUser (req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id)

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json(true)
    } catch (e) {
      console.trace(e)
      res.status(500).json(e)
    }
  }
}

module.exports = new UserController()
