const log = console.log
const $loginForm = document.querySelector('form')
const $emailInput = $loginForm.querySelector('#email')
const $passwordInput = $loginForm.querySelector('#password')

$loginForm.addEventListener('submit' , async (e) => {
    e.preventDefault()
    const url = 'http://localhost:3000/users/login'
    const h = new Headers()
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGZlMGRmZWRjOWYxM2Q4OWI3MTJkMjQiLCJpYXQiOjE2MjczMzI0OTF9.sHS_sKTxk3qf8DlPDQHCe1Nc4mVDNofOZxFp_JYjH3s"
    // h.append('Authorization', `Bearer ${token}`)
    h.append('Content-Type','application/json; charset=UTF-8')
    const req = new Request(url , {
        method: 'POST',
        mode: 'cors',
        headers: h,
        body: JSON.stringify({
            email: $emailInput.value,
            password: $passwordInput.value
        })
    }) 
    try {
        const res = await fetch(req)
        if (res.status === 200) {
            const result = await res.json()
            localStorage.setItem('token', JSON.stringify(result.token))
            window.location.href = 'http://localhost:3000/chat'
        }else{
            console.log({error: 'Please provide correct data!'})
        }
    } catch (error) {
        console.log({error: error})
    }
})