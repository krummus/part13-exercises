const router = require('express').Router()
const { tokenExtractor } = require('../util/middleware')

const { User, Blog, UserBlogs } = require('../models')
const { Op } = require('sequelize')

const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id)
  if (!user.admin) {
    return res.status(401).json({ error: 'operation not allowed' })
  }
  next()
}

router.get('/', async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: Blog,
      attributes: ['title']
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

router.get('/:id', async (req, res) => {

  const QUERY_USERS_WHERE = {
    readStatus: req.query.read === "true"
  }
  
  const where = (req.query.read) ? QUERY_USERS_WHERE : {}
  
  const user = await User.findByPk(req.params.id, {
    attributes: ['name','username'],
    include: [{
      model: Blog,
      as: 'readings',
      attributes: ['id','url','title','author','likes','year'],
      through: {
        as: 'readinglists',
        attributes: ['id','readStatus'],
        where
      },
    }]
  })

  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.put('/:username', tokenExtractor, isAdmin, async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.params.username
    }
  })

  if (user) {
    user.disabled = req.body.disabled
    await user.save()
    res.json(user)
  } else {
    res.status(404).end()
  }
})


module.exports = router