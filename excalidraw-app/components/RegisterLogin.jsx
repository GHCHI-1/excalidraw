import React, { useState } from 'react';
import axios from 'axios';

const RegisterLogin = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        try {
            const endpoint = isRegister ? '/api/register' : '/api/login';
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
                { username, password }
            );
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('token', response.data.token);
            onLogin(response.data.user_id, response.data.token);
            setError('');
        } catch (err) {
            setError(`Failed to ${isRegister ? 'register' : 'log in'}. Try again.`);
        }
    };

    const handleAnonymous = async () => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/register`,
                { anonymous: true }
            );
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('token', response.data.token);
            onLogin(response.data.user_id, response.data.token);
            setError('');
        } catch (err) {
            setError('Failed to create anonymous account.');
        }
    };

    return (
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <h3>{isRegister ? 'Register' : 'Log In'}</h3>
            <input
                type="text"
                placeholder="Username (optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <input
                type="password"
                placeholder="Password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button
                onClick={handleSubmit}
                style={{
                    padding: '10px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                {isRegister ? 'Register' : 'Log In'}
            </button>
            <button
                onClick={handleAnonymous}
                style={{
                    padding: '10px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Anonymous Account
            </button>
            <button
                onClick={() => setIsRegister(!isRegister)}
                style={{
                    padding: '10px',
                    background: 'transparent',
                    color: '#007bff',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                {isRegister ? 'Switch to Log In' : 'Switch to Register'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default RegisterLogin;
