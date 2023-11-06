const router = require('express').Router()

const { UserBlogs } = require('../models')

router.post('/', async (req, res) => {
    try {
      const readingListItem = await UserBlogs.create({ blogId: req.body.blogId, userId: req.body.userId, readStatus: false })
      res.json(readingListItem)
    } catch(error) {
      return res.status(400).json({ error })
    }
})

router.put('/:id', async (req, res) => {
  const readingListItem = await UserBlogs.findByPk(req.params.id)
  try {
    readingListItem.readStatus = req.body.read
    await readingListItem.save()
    res.json(readingListItem)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

module.exports = router