'use-strict'

const socket = io({autoConnect: false})


// Add-User Form Elements

const $addUserForm = document.querySelector('#add-user-form')
const $addUserEmailInpit = $addUserForm.querySelector('#add-user-email')
const $addUserButton = $addUserForm.querySelector('#add-user-button')


// Chat Form Elements
const $chatForm = document.querySelector('#chat-form')
const $chatFormInput = $chatForm.querySelector('input')
const $sendMessageButton = $chatForm.querySelector('button')
const $messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML


// User Token via login or Signup

const token = JSON.parse(localStorage.getItem('token'))
console.log("token", token)

socket.auth = {token}
socket.connect()

// List friends on the side-bar
socket.on('userFriendsList', ({friends}) => {
    console.log(friends)
    
})




socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message
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
    headers.append('Authorization',`Bearer ${token}`)

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
        if(response.status === 200){
            const res = await response.json()
            alert(res.response)
        }else{
            const res = await response.json()
            throw new Error(res.error.toString())
        }
    } catch (error) {
        alert(error)
    }

})