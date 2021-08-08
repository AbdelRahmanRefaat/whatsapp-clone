'use-strict'

const socket = io({ autoConnect: false })


// Add-User Form Elements

const $addUserForm = document.querySelector('#add-user-form')
const $addUserEmailInpit = $addUserForm.querySelector('#add-user-email')
const $addUserButton = $addUserForm.querySelector('.add-user-button')


// Chat Form Elements
const $chatScreen = document.querySelector('.chat__main')
const $chatForm = document.querySelector('#chat-form')
const $chatFormInput = $chatForm.querySelector('#message-input')
const $sendMessageButton = $chatForm.querySelector('#send-message')
const $messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// User Token via login or Signup

const token = JSON.parse(localStorage.getItem('token'))
console.log("token", token)

socket.auth = { token }
socket.connect()



const autoScroll = () => {
    // New message ELement

    const $newMessage = $messages.lastElementChild

    // Height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight


    // How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight


    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight    
    }

}

// Used for rendering messages to chat

const renderMessage = (message) => {
    const html = Mustache.render(messageTemplate, {
        message_body: message.message_body,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username

    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
}


// List existing friends on the side-bar
socket.on('loadUserFriendsList', async ({ friends }) => {

    const friendsArray = []
    friends.forEach(element => friendsArray.push(element.friend));
    const html = await Mustache.render(sidebarTemplate, {
        friends: friendsArray
    })
    document.querySelector('.friends-list').innerHTML = html
    //.insertAdjacentHTML('beforeend', html)

    // This is a dummy idea to make users list clickable
    // cus i am to lazy to learn front-end stuff
    // const fButtons = document.querySelectorAll('button')
    // console.log(fButtons)
    const fButtons = document.querySelectorAll('.list-group-item')
    console.log(fButtons)
    for (let i = 0; i < fButtons.length; i++) { // igoner add friend and logout and send message buttons
        
        
        fButtons[i].addEventListener('click', (e) => {
            console.log("Target" , e.target.parentElement)
        
            const activeElement = document.querySelector('.active')
            if(activeElement && activeElement.id !== e.target.id ){
                activeElement.classList.remove('active')
            }

            var parElement = e.target
            while(parElement.tagName !== 'LI')
                parElement = parElement.parentElement

            parElement.classList.add('active')            

            // enable chat once a user to chat with is selected
            if ($chatScreen.classList.contains('hidden')) {
                $chatScreen.classList.remove('hidden')
            }
            // clear chat before switching to another chat
            $messages.innerHTML = ''

            // Check if the user is in a chat already or not 
            if(socket.room){
                socket.emit('leave-chat', socket.room)
                socket.room = undefined // leaving the chat or swapping to another
            }
            // start chatting
            socket.emit('chat-to', { to: e.target.id }, (room) => {
                socket.room = room
                socket.emit('loadChatMessages', (messages) => {
                    messages.forEach((item) => {
                        renderMessage(item.message)
                    })

                })
            })
        })
    }
})




socket.on('message', (message) => {
    console.log(message)
    renderMessage(message)
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
            socket.emit('new-user-added')
            alert(res.response)

        } else {
            const res = await response.json()
            throw new Error(res.error.toString())
        }
    } catch (error) {
        alert(error)
    }

    // clear add friend field
    $addUserEmailInpit.value = ''

})

document.querySelector('#logout-button').addEventListener('click', async (e) => {
    const url = 'http://localhost:3000/users/logout'

    const headers = new Headers()
    headers.append('Content-Type', 'application/json; charset=UTF-8')
    headers.append('Authorization', `Bearer ${token}`)

    const req = new Request(url, {
        method: 'POST',
        mode: 'cors',
        headers,
    })
    try {
        const response = await fetch(req)
        if (response.status === 200) {
            window.location.href = `http://localhost:3000/`
        } else {
            throw new Error('Something went wrong!')
        }
    } catch (error) {
        console.log(error)
    }
})