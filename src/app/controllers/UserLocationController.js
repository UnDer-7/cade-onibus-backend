'use strict'

const UserLocation = require('../models/UserLocation')
const schedule = require('node-schedule')

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

  async getUserByNumero (req, res) {
    try {
      const userLocation = await UserLocation.find({ numero: req.params.linha })

      if (userLocation.length < 1) {
        return res.status(404).json('bus not found')
      }

      res.status(200).json(userLocation)
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

  /**
   * Procura por registros antigos (10min sem atualizações) e apaga eles.
   * Task é rodada de 10 em 10 min
   */
  deleteOldUserLocation () {
    let rule = new schedule.RecurrenceRule()
    rule.minute = new schedule.Range(0, 59, 10)

    schedule.scheduleJob(rule, async fireDate => {
      console.log('Running task at: ', fireDate)
      const currentDate = new Date()
      try {
        const userLocation = await UserLocation.find()
        const busToDelete = userLocation.filter(item => {
          const diff = (currentDate - item.hora) / 1000
          const seconds = Math.floor(diff)
          if (seconds > 600) {
            return item
          }
        })
        busToDelete.forEach(async item => {
          await UserLocation.findByIdAndDelete(item._id)
        })
      } catch (e) {
        throw Error(`Unable to delete old registers from UserLocation\n${e}`)
      }
    })
  }
}

module.exports = new UserLocationController()
