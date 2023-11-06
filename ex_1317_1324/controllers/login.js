const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const User = require('../models/user')
const Session = require('../models/session')

router.post('/', async (req, res) => {
  const body = req.body

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  console.log(body)
  const passwordCorrect = body.password === 'secret'

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password'
    })
  }

  if (user.disabled) {
    return res.status(401).json({
      error: 'account disabled, please contact admin'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  const token = await jwt.sign(userForToken, SECRET)
  try {
    await Session.destroy({
      where: {
        userId: user.id
      }
    })
    console.log('previous sessions cancelled')
    await Session.create({sessionToken: token, userId: user.id, date: new Date()})
  } catch (error) {
    res.status(500).json(error)
  }

  res
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = router