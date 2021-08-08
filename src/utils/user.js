const jwt = require('jsonwebtoken')

const User = require('../models/user')

const getUserData = async(socket) => {
    const token = socket.handshake.auth.token
    const decoded = jwt.decode(token, 'dafuqelgamed')
    const user = await User.findOne({_id: decoded._id})
    socket.user = user
    return user
}
const getUserFriends = async(_id) => { 
    const user = await User.findOne({_id})
    return user.friends
}

module.exports = {getUserData, getUserFriends}