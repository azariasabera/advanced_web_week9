// this will handle the home page
// If not logged in, show links to login and register
// If logged in, show email linked to the token, and a logout button

// It will be like this:

let notLoggedDiv = document.getElementById('notLogged')
let loggedDiv = document.getElementById('logged')

if (localStorage.getItem('auth_token')) {
    notLoggedDiv.innerHTML = ''
    let logout = document.getElementById('logout')
    logout.onclick = () => {
        localStorage.removeItem('auth_token')
        window.location.href = '/'
    }

    // to show the email linked to the token, we need to decode the token:
    let token = localStorage.getItem('auth_token')
    let payload = token.split('.')[1]
    let decodedPayload = atob(payload)
    let emailFromToken = JSON.parse(decodedPayload).email
    let email = document.getElementById('user-email')
    email.textContent = `Email: ${emailFromToken}`

    let addItem = document.getElementById('add-item')
    // when user clicks enter in the input field, it should click the add button
    addItem.addEventListener('keyup', function(event) {
        if (event.keyCode === 13) {
            event.preventDefault()
            let item = {
                items: [addItem.value]
            }
            fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                },
                body: JSON.stringify(item),
            })
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error('Failed to add item')
                    }
                })
                .then(data => {
                    console.log(data)
                    addItem.value = ''
                    displayItems(data.items)
                })
                .catch(error => {
                    console.error('Error:', error)
                })
        }
    })
            
} else {
    loggedDiv.style.display = 'none'
    let h1 = document.createElement('h1')
    h1.textContent = 'Register or Login to access the content'
    notLoggedDiv.appendChild(h1)
    
    let register = document.createElement('a')
    register.href = '/register.html'
    register.textContent = 'Register'
    notLoggedDiv.appendChild(register)

    notLoggedDiv.appendChild(document.createElement('br'))
    notLoggedDiv.appendChild(document.createElement('br'))

    let login = document.createElement('a')
    login.href = '/login.html'
    login.textContent = 'Login'
    notLoggedDiv.appendChild(login)
}

function displayItems(items) {
    let itemsDiv = document.getElementById('items')
    itemsDiv.innerHTML = ''
    items.forEach(item => {
        let p = document.createElement('p')
        p.textContent = item
        itemsDiv.appendChild(p)
    })
}