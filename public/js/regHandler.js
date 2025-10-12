document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('regisForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        
        // Obtener los valores del formulario
        const username = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validación básica en el cliente
        if (password.length < 6) {
            document.getElementById('errorMessage').textContent = 'La contraseña debe tener al menos 6 caracteres';
            return;
        }
        
        const datosIngreso = {  
            username: username,
            email: email, 
            password: password
        };
        
        try {
            const response = await fetch('/auth/registerUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosIngreso)
            });

            const errorMessage = document.getElementById('errorMessage');
            const resultados = await response.json();
            
            if (!response.ok) {
                errorMessage.textContent = resultados.error;
                errorMessage.style.color = '#e74c3c';
            } else {
                errorMessage.textContent = resultados.message || 'Se creó el usuario correctamente. Verifica tu email.';
                errorMessage.style.color = '#27ae60';
                
                // Limpiar formulario
                document.getElementById('regisForm').reset();
                
                // Redirigir después de 3 segundos
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('errorMessage').textContent = 'Error en la conexión';
            document.getElementById('errorMessage').style.color = '#e74c3c';
        }
    });
});