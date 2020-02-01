'use strict'

const User = require('../models/User')

class SessionController {
  async login (req, res) {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(400).json({ error: 'User not found' })
      }

      if (!(await user.compareHash(password))) {
        return res.status(400).json({ error: 'Invalid Password' })
      }

      return res.status(200).json({ token: User.createToken(user) })
    } catch (e) {
      console.trace(e)
      res.status(500).json(e)
    }
  }

  async loginWithGoogle (req, res) {
    try {
      const { email, userId } = req.body
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(400).json('User not found')
      }

      if (userId !== user.userId) {
        return res.status(400).json('Invalid User')
      }

      return res.status(200).json({ token: User.createToken(user) })
    } catch (e) {
      console.trace(e)
      res.status(500).json(e)
    }
  }
}

module.exports = new SessionController()
