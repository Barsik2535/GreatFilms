
import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import{HttpTransportType}from '@microsoft/signalr';
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

const PostItem:React.FC<
{
    post:ForumPost;
    allPosts:ForumЗost[];
    onReply:(id:number)=>void;
    replyTo:number | null;
    level?: number;
}>=({post,allPosts,onReply,replyTo,level=0})=>
{

const childReplies=allPosts.filter(p=>p.parentId===post.id)

return (
        <>
    <div style={{marginBottom:20,paddingLeft:level*40}}>
        <strong>
            {post.userName}
        </strong>
      <span style={{marginLeft:10, fontSize:'0.8em',color:'#666'}}>
        {post.createdAt?new Date(post.createdAt).toLocaleString():"даты нет!!"}
      </span>
        <p>{post.text}</p>
      <button onClick={()=>onReply(post.id)}>Ответить</button>
     </div>
        {childReplies.map(reply=>(
            <PostItem
            key={reply.id}
            post={reply}
            allPosts={allPosts}
            onReply={onReply}
            replyTo={replyTo}
            level={level+1}
            />
        ))}
        </>
       );
};

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

    let isMounted = true;
    let connection: signalR.HubConnection | null = null;
    let startPromise: Promise<void> | null = null;

    const initConnection = async () => {
        connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5108/ChatHub', {
                accessTokenFactory: () => token,
                transport: signalR.HttpTransportType.WebSockets,

            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceivePost', (post: ForumPost) => {
              console.log("Получен пост от сервера:", post); 
            if (isMounted) setPosts(prev => [...prev, post]);
        });

        connectionRef.current = connection;

        try {
            startPromise = connection.start();
            await startPromise;
            if (isMounted) {
                await connection.invoke('JoinTopic', topicId);
            }
        } catch (err) {
            if (isMounted) {
                const msg = err?.message || err?.toString() || '';
                if (!msg.includes('negotiation')) {
                    console.error(err);
                }
            }
        }
    };

    initConnection();  

    return () => {
        isMounted = false;
        if (connection) {
            startPromise?.finally(() => {
                if (connection && 
                    (connection.state === signalR.HubConnectionState.Connected ||
                     connection.state === signalR.HubConnectionState.Connecting ||
                     connection.state === signalR.HubConnectionState.Reconnecting)) {
                    connection.stop().catch(() => {});
                }
            });
            connectionRef.current = null;
        }
    };
}, [token, topicId]);


    const sendPost = async () => {
        if (!newMessage.trim() || !connectionRef.current) return;

        await connectionRef.current.invoke('SendPost', topicId, newMessage, replyTo);
        setNewMessage('');
        setReplyTo(null);
        console.log(`message sended`);

    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
            <button onClick={() => navigate(-1)}>← Назад</button>
            <h1>Форум по теме #{topicId}</h1>

            <div style={{ maxHeight: '70vh', overflowY: 'auto', border: '1px solid #ddd', padding: 15 }}>
               {
                   posts.filter(p=>!p.parentId).map(post=>(
                       <PostItem
                       key={post.id}
                       post={post}
                       allPosts={posts}
                       onReply={setReplyTo}
                       level={0}
                       />
                   ))
               }
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