const API_URL = 'https://nozamafunctions.azurewebsites.net/api/ExecuteProcedure?';
async function executeProcedure(procedureName, params) {
    if (!procedureName) {
        throw new Error('The stored procedure name (procedureName) is required.');
    }
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ procedureName, params }),
        });        
        // Verificar si el cuerpo de la respuesta está vacío
        if (response.status === 204 || response.headers.get('Content-Length') === '0') {
            console.warn('No content in the response');
            return null; // Manejar respuestas vacías
        }
        const result = await response.json(); // Intentar parsear la respuesta
        return result;
    } catch (error) {
        console.error('Error connecting to the API:', error.message);
        throw error;
    }
}
