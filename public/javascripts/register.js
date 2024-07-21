if (document.readyState !== 'loading') {
    initializeCodeLogin();
}
else {
    document.addEventListener('DOMContentLoaded', initializeCodeLogin);
}

function initializeCodeLogin() {
    // Code to run when the document is ready
    document.getElementById('register-form').addEventListener('submit', onSubmit);
}

async function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
        let response = await fetch('/api/user/register', {
            method: 'POST',
            body: formData
        })
        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            let data = await response.text();
            alert(data);
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}