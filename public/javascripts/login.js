if (document.readyState !== 'loading') {
    initializeCodeLogin();
}
else {
    document.addEventListener('DOMContentLoaded', initializeCodeLogin);
}

function initializeCodeLogin() {
    // Code to run when the document is ready
    document.getElementById('login-form').addEventListener('submit', onSubmit);
}

function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(formData);

    fetch('/api/user/login', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Login failed');
            }
        })
        .then(data => {
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                window.location.href = '/';
            }
            else {
                console.error('Token not found');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}