'use strict'

const UserLocation = require('../models/UserLocation')

class UserLocationController {
  async createUserLocation (req, res) {
    try {
      const userlocation = await UserLocation.findOneAndUpdate(
        { sequencial: req.body.sequencial },
        req.body,
        { upsert: true })

      return res.status(201).json(userlocation)
    } catch (e) {
      console.trace(e)
      return res.status(500).json({ error: e })
    }
  }

  async updateUserLocation (req, res) {
    try {
      const userlocation = await UserLocation.findOneAndUpdate(req.params.id, req.body, { new: true })
      return res.status(200).json(userlocation)
    } catch (e) {
      console.trace(e)
      return res.status(500).json({ error: e })
    }
  }

  async getAllUserLocation (req, res) {
    try {
      const userlocation = await UserLocation.paginate({}, {
        page: req.query.page || 1,
        limit: req.query.page || 25,
        sort: req.query.sort || '-createdAt'
      })
      res.status(200).json(userlocation)
    } catch (e) {
      console.trace(e)
      return res.status(500).json({ error: e })
    }
  }

  async getUserLocation (req, res) {
    try {
      const userlocation = await UserLocation.findById(req.params.id)

      if (!userlocation) {
        return res.status(404).json({ error: 'UserLocation not found' })
      }

      return res.status(200).json(userlocation)
    } catch (e) {
      console.trace(e)
      res.status(500).json({ error: e })
    }
  }

  async deleteUserLocation (req, res) {
    try {
      const userlocation = await UserLocation.findByIdAndDelete(req.params.id)

      if (!userlocation) {
        return res.status(404).json({ error: 'UserLocation not found' })
      }

      return res.status(200).json(true)
    } catch (e) {
      console.trace(e)
      res.status(500).json({ error: e })
    }
  }
}

module.exports = new UserLocationController()
