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

async function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        let response = await fetch('/api/user/login', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            let data = await response.json();
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                window.location.href = '/';
            }
            else {
                console.error('Token not found');
            }
        } else {
            let data = await response.text();
            //alert(data);
            let error = document.getElementById('error-message');
            error.textContent = data;
        }
} catch (error) {
    console.error('Error:', error);
}}