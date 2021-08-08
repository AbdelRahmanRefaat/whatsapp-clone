
const log = console.log

const $signupForm = document.querySelector('form')
const $usernameInput = $signupForm.querySelector('#username')
const $emailInput = $signupForm.querySelector('#email')
const $passwordInput = $signupForm.querySelector('#password')


$signupForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const url = 'http://localhost:3000/users'
    const headers = new Headers()
    headers.append('Content-Type', 'application/json; charset=UTF-8')

    const req = new Request(url, {
        method: 'POST',
        mode: 'cors',
        headers,
        body: JSON.stringify({
            username: $usernameInput.value,
            email: $emailInput.value,
            password: $passwordInput.value
        })
    })
    try {
        const response = await fetch(req)
        if(response.status === 200){
            const result = await response.json()
            localStorage.setItem('token', JSON.stringify(result.token))
            window.location.href = `http://localhost:3000/chat?token=${result.token}`
        }else{
            console.log({error: 'Email already in use!. Try login!'})
        }

    } catch (error) {
        console.log({error: error})
    }

})