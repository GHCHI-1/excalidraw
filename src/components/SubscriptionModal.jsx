import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionModal = ({ userId, token, onAccessGranted }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [message, setMessage] = useState('');

    const checkAccess = async () => {
        if (!userId || !token) {
            setMessage('Please register or log in.');
            setIsOpen(true);
            return;
        }
        try {
            const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/check-access', { user_id: userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.access) {
                onAccessGranted();
            } else if (response.data.needs_subscription) {
                setMessage('Trial used. Please subscribe.');
                setIsOpen(true);
                const paymentResponse = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/create-payment', {
                    user_id: userId,
                    amount: 10
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQrCode(paymentResponse.data.qrcode);
                setOrderId(paymentResponse.data.order_id);
            }
        } catch (error) {
            setMessage('Error checking access.');
            setIsOpen(true);
        }
    };

    useEffect(() => {
        if (!orderId || !token) return;
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/subscription-status/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.subscription_status === 'active') {
                    setIsOpen(false);
                    setQrCode(null);
                    setOrderId(null);
                    onAccessGranted();
                }
            } catch (error) {
                console.error('Error polling:', error);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [orderId, token, onAccessGranted]);

    return (
        <div>
            <button
                onClick={checkAccess}
                style={{
                    padding: '10px 20px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Start Collaboration
            </button>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <h2>Collaboration Access</h2>
                        <p>{message}</p>
                        {qrCode && (
                            <>
                                <p>Scan with WeChat to subscribe:</p>
                                <img src={qrCode} alt="WeChat Pay QR Code" style={{ maxWidth: '200px' }} />
                                <p>Waiting for payment...</p>
                            </>
                        )}
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                padding: '10px 20px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                marginTop: '10px'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionModal;
