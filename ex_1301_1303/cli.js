require('dotenv').config()

const { Sequelize, Model, DataTypes, QueryTypes } = require('sequelize')
const express = require('express')
const app = express()

const sequelize = new Sequelize(process.env.DATABASE_URL);

class Blog extends Model {}
Blog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author: {
    type: DataTypes.TEXT
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    default: 0
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'blog'
})

const main = async () => {
    try {
        await sequelize.authenticate()
        const blogs = await sequelize.query("SELECT * FROM blogs", { type: QueryTypes.SELECT })
        let retString = ''
        blogs.map(dat => {
            retString = retString + dat.author.toString() + ': \'' + dat.title.toString() + '\' , ' + dat.likes.toString() + ' likes \n'
        })
        console.log(retString)
        sequelize.close()
    } catch (error) {
        console.log(error, 'error here')
    }
}

main()


