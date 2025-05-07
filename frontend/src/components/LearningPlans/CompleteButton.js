import React from 'react';
import axios from 'axios';

const handleComplete = async () => {
    try {
        const token = localStorage.getItem('authToken'); // Retrieve token from storage
        if (!token) {
            alert('You need to log in again.');
            return; // Redirect to login if token is missing
        }

        const response = await axios.post('/api/complete', { /* request payload */ }, {
            headers: {
                Authorization: `Bearer ${token}`, // Include token in the request
            },
        });

        if (response.status === 200) {
            alert('Action completed successfully!');
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert('Session expired. Please log in again.');
            // Redirect to login page
        } else {
            console.error('Error completing action:', error);
        }
    }
};

const CompleteButton = () => {
    return (
        <button onClick={handleComplete}>Complete</button>
    );
};

export default CompleteButton;