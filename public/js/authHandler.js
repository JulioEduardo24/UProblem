document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) errorMessage.textContent = '';

        const datos = { email, password };

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos),
            });

            const resultado = await response.json();

            if (!response.ok) {
                // Si el error es por email no verificado
                if (resultado.requiresVerification) {
                    if (errorMessage) {
                        errorMessage.textContent = resultado.error;
                        errorMessage.style.color = '#f39c12'; // Color de advertencia
                    }
                    
                    // Crear botón para reenviar email
                    let resendBtn = document.querySelector('.resend-btn');
                    if (!resendBtn) {
                        resendBtn = document.createElement('button');
                        resendBtn.type = 'button';
                        resendBtn.className = 'button-confirm resend-btn';
                        resendBtn.textContent = 'Reenviar Email de Verificación';
                        resendBtn.style.marginTop = '10px';
                        errorMessage.parentElement.insertBefore(resendBtn, errorMessage.nextSibling);
                        
                        resendBtn.addEventListener('click', async () => {
                            await resendVerificationEmail(email, resendBtn);
                        });
                    }
                } else {
                    // Otros errores (credenciales incorrectas, etc)
                    if (errorMessage) {
                        errorMessage.textContent = resultado.error || 'Error al iniciar sesión';
                        errorMessage.style.color = '#e74c3c'; // Color de error
                    }
                }
            } else {
                // Login exitoso
                if (errorMessage) {
                    errorMessage.textContent = 'Iniciando sesión...';
                    errorMessage.style.color = '#27ae60'; // Color de éxito
                }
                localStorage.setItem('isLoggedIn', 'true');
                setTimeout(() => {
                    window.location.href = '/out/';
                }, 1000);
            }
        } catch (error) {
            if (errorMessage) {
                errorMessage.textContent = error.message || 'Error en la conexión';
                errorMessage.style.color = '#e74c3c';
            }
        }
    });
});

// Función para reenviar email de verificación
async function resendVerificationEmail(email, button) {
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Enviando...';

    try {
        const response = await fetch('/auth/reenviar-verificacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const resultado = await response.json();
        const errorMessage = document.getElementById('errorMessage');

        if (response.ok) {
            if (errorMessage) {
                errorMessage.textContent = '✓ ' + resultado.message;
                errorMessage.style.color = '#27ae60'; // Verde
            }
            button.textContent = 'Email reenviado ✓';
            button.disabled = true;
        } else {
            if (errorMessage) {
                errorMessage.textContent = resultado.error || 'Error al reenviar el email';
                errorMessage.style.color = '#e74c3c'; // Rojo
            }
            button.disabled = false;
            button.textContent = originalText;
        }
    } catch (error) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = 'Error en la conexión';
            errorMessage.style.color = '#e74c3c';
        }
        button.disabled = false;
        button.textContent = originalText;
    }
}