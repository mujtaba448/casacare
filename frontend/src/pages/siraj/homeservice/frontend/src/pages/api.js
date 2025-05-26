const API_URL = 'http://localhost/service-backend';

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return response.json();
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return response.json();
};
