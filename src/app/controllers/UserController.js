/* eslint-disable no-use-before-define */
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
    let user = req.body
    try {
      if (req.body.pacote) {
        let pricing
        switch (req.body.pacote.quantosDias) {
          case 3:
            pricing = 10
            break
          case 5:
            pricing = 15
            break
          case 7:
            pricing = 18
            break
          default:
            break
        }
        user.moedas -= pricing
      }

      const userUpdated = await User.findOneAndUpdate({ _id: user._id }, user, { new: true })

      delete userUpdated.password
      return res.status(200).json(userUpdated)
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

      delete user.password

      return res.status(200).json(user)
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

  async timeShared (req, res) {
    const { start, end, _id } = req.body
    const diff = calTimeDiff(start, end)

    const user = await User.findById(_id)
    user.moedas += diff

    const userUpdated = await user.save()

    const moedas = {
      made: diff,
      have: userUpdated.moedas
    }

    res.status(200).json(moedas)
  }
}

/**
 * Return the time diference in minutes
 * @param start - Start Date
 * @param end - End Date
 */
const calTimeDiff = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const milliseconds = Math.abs(endDate - startDate)
  const minutes = milliseconds / 60000
  return Math.floor(minutes)
}

module.exports = new UserController()
