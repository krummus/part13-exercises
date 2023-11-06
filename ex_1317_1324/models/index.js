const Blog = require('./blog')
const User = require('./user')
const UserBlogs = require('./user_blogs')
const Session = require('./session')

Blog.belongsTo(User)
User.hasMany(Blog)

User.belongsToMany(Blog, { through: UserBlogs, as: 'readings' })
Blog.belongsToMany(User, { through: UserBlogs, as: 'users_marked' })

module.exports = {
  Blog, User, UserBlogs, Session
}