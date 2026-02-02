const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = getCookie('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', async () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    
    try {
        await fetch('/auth/toggle-theme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme: newTheme })
        });
    } catch (error) {
        console.error('Error al guardar tema:', error);
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}