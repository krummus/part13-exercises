const jwt = require('jsonwebtoken')
const { SECRET } = require('./config.js')

const Session = require('../models/session')
const User = require('../models/user')

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
const errorHandler = (error, request, response, next) => {

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

const tokenExtractor = async (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        try {
            console.log('try 1')
            console.log(authorization.substring(7))

            try {
                console.log('try 2')
                const tokenToCheck = authorization.substring(7)
                const sesh = await Session.findOne({
                    where: {
                        sessionToken: tokenToCheck
                    }
                })
                if(!sesh) {
                    return res.status(401).json({ error: 'no active session found - please log in'})
                }
            } catch (error) {
                return res.status(401).json({ error: 'something went wrong '})
            }
            req.decodedToken = jwt.verify(authorization.substring(7), SECRET)

            try {
                const user = await User.findByPk(req.decodedToken.id)

                if(user.disabled) {
                    try{
                        await Session.destroy({
                            where: { id: sesh.id}
                        })
                    } catch (error) {
                        res.status(500).json({ error: 'session validity error '})
                    }
                    return res.status(401).json({ error: 'user is disabled, session cancelled, please contact the admin team'})
                }

            } catch (error) {
                return res.status(500).json(error)
            }

        } catch (error) {
            return res.status(401).json({error: 'error here token invalid'})
        }
    } else {
        return res.status(401).json({ error: 'token missing' })
    }
    next()
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    tokenExtractor
}