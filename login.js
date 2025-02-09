document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();

            const token = result.token;

            if (token) {
                localStorage.setItem('user_access_token', token)
                window.location.replace('home.html');
            } else {
                alert('Токен не найден в ответе!');
            }
        } else {
            alert('Ошибка авторизации');
        }
    } catch (error) {
        alert('Произошла ошибка при отправке запроса');
        console.error(error);
    }
});

window.onload = function() {
    const token = localStorage.getItem('user_access_token');

    if (token) {
        window.location.replace('home.html');
    }
}