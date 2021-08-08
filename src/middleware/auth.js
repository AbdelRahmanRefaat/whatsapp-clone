const log = console.log
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const qs = require('query-string')


const auth = async (req, res , next) => {
    
    log('Query', req.query.token)    
    try{
        let token
        if(req.header('Authorization'))
             token = req.header('Authorization').replace('Bearer ', '')
        else
            token = req.query.token
        log(token)
        const decoded = jwt.verify(token, 'dafuqelgamed')
        const _id = decoded._id
        const user = await User.findOne({_id, 'tokens.token': token})
        
      //  console.log(paresd)
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