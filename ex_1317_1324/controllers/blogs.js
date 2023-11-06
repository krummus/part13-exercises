const router = require('express').Router()
const { Op } = require('sequelize')
const { tokenExtractor } = require('../util/middleware')

const { Blog, User } = require('../models')

router.get('/', async (req, res) => {
  const QUERY_WHERE = {
    [Op.or]: [
      {
        title: {
          [Op.substring]: req.query.search
        }
      },
      {
        author: {
          [Op.substring]: req.query.search
        }
      }
    ]
  }

  const where = (req.query.search) ? QUERY_WHERE : {}
  console.log(where)

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [['likes', 'ASC']]
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({...req.body, userId: user.id, date: new Date()})
    res.json(blog)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
}

router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', tokenExtractor, blogFinder, async (req, res) => {
  if (req.blog) {
    if (req.blog.userId === req.decodedToken.id) {
      await req.blog.destroy()
    } else {
      res.status(401).json({ error: 'Only authorized users or blog creator may delete the selected blog' })
    }
  } else {
    res.status(204).json({ error: 'Blog not found'})
  }
})

router.put('/:id', tokenExtractor, blogFinder, async (req, res) => {
  if (req.blog) {
    if (req.blog.userId === req.decodedToken.id) {
      req.blog.likes = req.body.likes
      await req.blog.save()
      res.json({"likes": req.blog.likes})
    } else {
      res.status(401).json({ error: 'Only authorized users or blog creator may modify the selected blog' })
    }
  } else {
    res.status(404).json({ error: 'Blog not found'})
  }
})

module.exports = router