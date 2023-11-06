const router = require('express').Router()
const { tokenExtractor } = require('../util/middleware')

const Session = require('../models/session')

router.delete('/', tokenExtractor, async (req, res) => {
    console.log('making it here?')
    const body = req.body

    try {
        await Session.destroy({
            where: {
            user_id: req.decodedToken.id
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Session not cancelled '})
    }
    res.status(200).send('user logged out')
})

module.exports = router