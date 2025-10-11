document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('regisForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita el envío tradicional del formulario
    // Obtener los valores del formulario
    const username = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // Construir el objeto para enviar al API
    const datosIngreso = {  
        username: username,
        email: email, 
        password: password
    };
    
    /*console.log("-----");
    console.log(datosIngreso);
    console.log("-----");*/
    const response = await fetch('/auth/registerUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosIngreso)
    });

    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) errorMessage.textContent = '';

    const resultados = await response.json();
    if (!response.ok) {
        errorMessage.textContent = resultados.error;
    }else{
        var texto = JSON.stringify(resultados)
        errorMessage.textContent = "Se creó el usuario correctamente";
    }
});
})
