
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

interface Message {
    user: string;
    text: string;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState < Message[] > ([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const connectionRef = useRef < signalR.HubConnection | null > (null);
    const token = localStorage.getItem('token'); // берём токен после логина

    useEffect(() => {
        if (!token) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5108/chatHub', {  
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveMessage', (user: string, text: string) => {
            setMessages(prev => [...prev, { user, text }]);
        });

        connection.start()
            .then(() => {
                setIsConnected(true);
                console.log('SignalR подключён');
            })
            .catch(err => console.error(' Ошибка SignalR:', err));

        connectionRef.current = connection;

        return () => {
            connection.stop();
        };
    }, [token]);

    const sendMessage = async () => {
        if (!input.trim() || !connectionRef.current) return;
        try {
            await connectionRef.current.send('SendMessage', input.trim());
            setInput('');
        }
        catch (err) {
            console.error(err);
        }
       
    };

    const logout = () => {
        localStorage.removeItem('token');
 
        window.location.reload();
    };

    if (!token) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Вы не авторизованы</h2>
                <p>Пожалуйста, войдите через страницу логина.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>Чат обсуждения</h1>
                <div>
                    <span>Состояние: {isConnected ? 'Подключено' : 'Подключение...'}</span>
                    &nbsp;&nbsp;
                    <button onClick={logout}>Выйти</button>
                </div>
            </div>

      
            <div
                style={{
                    height: '500px',
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f9f9f9',
                    marginBottom: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}
            >
                {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888' }}>
                         Напишите первое сообщение!
                    </p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#fff',
                                alignSelf: 'flex-start',
                                maxWidth: '80%'
                            }}
                        >
                            <strong>{msg.user}:</strong> {msg.text}
                        </div>
                    ))
                )}
            </div>

      
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Напишите сообщение..."
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                    }}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};

export default Chat;