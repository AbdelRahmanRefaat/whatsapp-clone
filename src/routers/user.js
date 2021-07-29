const log = console.log

const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/users', async (req, res) => {
    log(req.body)
    const user = new User(req.body)
    log(user)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        log(user)
        res.status(200).send({ token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    log(req.body)
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        //return res.redirect('/chat')
        res.status(200).send({ token })
    } catch (error) {
        res.status(400).send({ error: 'Email or password is incorrect!' })
    }
})

router.post('/users/adduser', auth, async (req, res) => {
    
    try {
        const {email} = req.body
        const user_to_add = await User.findOne({email})

        if(!user_to_add){
            throw new Error('User not found!')           
        }

        log(req.user.friends)
        console.log(user_to_add._id, req.user._id)
        console.log(user_to_add._id.equals(req.user._id))
        if(user_to_add._id.equals( req.user._id)){
            throw new Error('You cant add yourself!')
        }

        
        const isExist = req.user.friends.find( (friend) => {
            return friend._id.equals( user_to_add._id) 
        })

        if(isExist){
            throw new Error('User already in your friends list!')
        }
        req.user.friends.push(user_to_add._id)
        await req.user.save()
        res.status(200).send({response: 'User added succesfully'})

    } catch (error) {
        res.status(400).send({error: error.toString()})

    }
})

module.exports = router