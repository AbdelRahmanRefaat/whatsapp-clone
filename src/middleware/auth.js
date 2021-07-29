const log = console.log
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res , next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'dafuqelgamed')
        const _id = decoded._id
        const user = await User.findOne({_id, 'tokens.token': token})
        if(!user){
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    }catch(error){
        res.status(400).send({error: 'Please Authenticate!'})
    }
}

module.exports = auth