require('dotenv').config()

const { Sequelize, Model, DataTypes, QueryTypes } = require('sequelize')
const express = require('express')
const app = express()

const sequelize = new Sequelize(process.env.DATABASE_URL);

class Note extends Model {}
Note.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  important: {
    type: DataTypes.BOOLEAN
  },
  date: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'note'
})

Note.sync()

app.use(express.json())

app.get ('/', async (req, res) => {
  res.send('server is running')
})

app.post('/api/notes', async (req, res) => {
  console.log('coming here')
  try {
    const note = await Note.create(req.body)
    console.log('note')
    res.json(note)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

app.put('/api/notes/:id', async (req, res) => {
  const note = await Note.findByPk(req.params.id)
  if (note) {
    note.important = req.body.important
    await note.save()
    res.json(note)
  } else {
    res.status(404).end()
  }
})

app.get('/api/notes/:id', async (req, res) => {
  const note = await Note.findByPk(req.params.id)
  console.log(note.toJSON())
  if(note) {
    res.json(note)
  } else {
    res.status(404).end()
  }
})

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.findAll()
    res.json(notes)
  } catch (error) {
    return res.status(502).json({error})
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})