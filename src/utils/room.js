const Room = require('../models/room')

const createRoomName = (to, user_id) => {
    let name
    if(to <= user_id){
        name = to.toString() + '' + user_id.toString()
    }else{
        name = user_id.toString() + '' + to.toString()
    } 
    return name
}

const createRoom = async(to, user_id) => {
    let name = createRoomName(to, user_id)
    const room = new Room({name, users: [to, user_id] })
    await room.save()
    return room

}

module.exports = {createRoomName, createRoom}