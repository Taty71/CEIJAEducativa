// Test rápido del endpoint POST
const testData = {
    dni: "12345678",
    nombre: "Test",
    apellido: "Usuario",
    email: "test@example.com",
    modalidad: "Presencial"
};

fetch('http://localhost:5000/api/registros-pendientes', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
.then(response => {
    console.log('Status:', response.status);
    return response.text();
})
.then(data => {
    console.log('Response:', data);
    try {
        const json = JSON.parse(data);
        console.log('Parsed JSON:', json);
    } catch {
        console.log('Not JSON:', data);
    }
})
.catch(error => {
    console.error('Error:', error);
});