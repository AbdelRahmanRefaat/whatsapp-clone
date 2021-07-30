'use-strict'

const socket = io({ autoConnect: false })


// Add-User Form Elements

const $addUserForm = document.querySelector('#add-user-form')
const $addUserEmailInpit = $addUserForm.querySelector('#add-user-email')
const $addUserButton = $addUserForm.querySelector('#add-user-button')


// Chat Form Elements
const $chatScreen = document.querySelector('.chat__main')
const $chatForm = document.querySelector('#chat-form')
const $chatFormInput = $chatForm.querySelector('input')
const $sendMessageButton = $chatForm.querySelector('button')
const $messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// User Token via login or Signup

const token = JSON.parse(localStorage.getItem('token'))
console.log("token", token)

socket.auth = { token }
socket.connect()





// List existing friends on the side-bar
socket.on('userFriendsList', async ({ friends }) => {
    
    const friendsArray = []
    friends.forEach(element => friendsArray.push(element.friend));
    const html = await Mustache.render(sidebarTemplate, {
        friends: friendsArray
    })
    document.querySelector('#sidebar').insertAdjacentHTML('beforeend', html)

    // This is a dummy idea to make users list clickable
    // cus i am to lazy to learn front-end stuff
    const fButtons = document.querySelectorAll('button')
    for(let i = 1; i < fButtons.length - 1; i++){ // igoner add friend and send message buttons
        fButtons[i].addEventListener('click', async (e) => {
           // console.log(e.target.id)
            // enable chat once a user to chat with is selected
            if($chatScreen.classList.contains('hidden')){
                $chatScreen.classList.remove('hidden')
            }
            // clear chat before switching to another chat
            $messages.innerHTML = ''

            // start chatting
            await socket.emit('chat-to', {to: e.target.id})


            // load messages in the room
            socket.emit('loadChatMessages', (messages) => {
                console.log(messages)
            })
        })
    }

})




socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message_body: message.message_body,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
})



$chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value

    // disable 
    $sendMessageButton.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', (message), () => {
        $chatFormInput.value = ''
        $chatFormInput.focus()
        $sendMessageButton.removeAttribute('disabled')

    })

})

$addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const url = 'http://localhost:3000/users/adduser'

    const headers = new Headers()
    headers.append('Content-Type', 'application/json; charset=UTF-8')
    headers.append('Authorization', `Bearer ${token}`)

    const req = new Request(url, {
        method: 'POST',
        mode: 'cors',
        headers,
        body: JSON.stringify({
            email: $addUserEmailInpit.value
        })
    })

    try {
        const response = await fetch(req)
        if (response.status === 200) {
            const res = await response.json()
            alert(res.response)
        } else {
            const res = await response.json()
            throw new Error(res.error.toString())
        }
    } catch (error) {
        alert(error)
    }

})
