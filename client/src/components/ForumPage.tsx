
import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ForumPost {
    id: number;
    userName: string;
    firstName?: string;
    lastName?: string;
    text: string;
    createdAt: string;
    parentId?: number;
    replies?: ForumPost[];
}

const ForumPage: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();

    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    const token = localStorage.getItem('token');
  
    // Загружаем существующие посты
    const loadPosts = async () => {
        const res = await axios.get(`http://localhost:5108/api/forum/${topicId}`);
        setPosts(res.data);
    };

    useEffect(() => {
        if (!token || !topicId) return;
        loadPosts();

        const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5108/ChatHub', {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceivePost', (post: ForumPost) => {
            setPosts(prev => [...prev, post]);
        });

        connection.start()
            .then(() => connection.invoke('JoinTopic', topicId))
            .catch(console.error);

        connectionRef.current = connection;

        return () => { connection.stop(); };
    }, [token, topicId]);

    const sendPost = async () => {
        if (!newMessage.trim() || !connectionRef.current) return;

        await connectionRef.current.invoke('SendPost', topicId, newMessage, replyTo);
        setNewMessage('');
        setReplyTo(null);
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
            <button onClick={() => navigate(-1)}>← Назад</button>
            <h1>Форум по теме #{topicId}</h1>

            <div style={{ maxHeight: '70vh', overflowY: 'auto', border: '1px solid #ddd', padding: 15 }}>
                {posts.map(post => (
                    <div key={post.id} style={{ marginBottom: 20, paddingLeft: post.parentId ? 40 : 0 }}>
                        <strong>
                            {post.firstName} {post.lastName} ({post.userName})
                        </strong>
                        <span style={{ marginLeft: 10, fontSize: '0.8em', color: '#666' }}>
                            {new Date(post.createdAt).toLocaleString()}
                        </span>
                        <p>{post.text}</p>
                        <button onClick={() => setReplyTo(post.id)}>Ответить</button>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 20 }}>
                {replyTo && <small>Отвечаете на пост #{replyTo}</small>}
                <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Напишите сообщение..."
                    style={{ width: '100%', height: 100 }}
                />
                <button onClick={sendPost}>Отправить</button>
                {replyTo && <button onClick={() => setReplyTo(null)}>Отмена</button>}
            </div>
        </div>
    );
};

export default ForumPage;