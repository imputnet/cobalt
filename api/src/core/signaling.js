import { WebSocketServer } from 'ws';
import { Green } from '../misc/console-text.js';

export const setupSignalingServer = (httpServer) => {
    const wss = new WebSocketServer({ 
        server: httpServer,
        path: '/ws'
    });

    const sessions = new Map(); // sessionId -> { creator, joiner, createdAt }

    // 清理过期会话
    setInterval(() => {
        const now = Date.now();
        for (const [sessionId, session] of sessions.entries()) {
            if (now - session.createdAt > 30 * 60 * 1000) { // 30分钟过期
                sessions.delete(sessionId);
                console.log(`清理过期会话: ${sessionId}`);
            }
        }
    }, 5 * 60 * 1000); // 每5分钟检查一次

    wss.on('connection', (ws, req) => {
        console.log('WebSocket连接建立:', req.socket.remoteAddress);
        
        let sessionId = null;
        let userRole = null; // 'creator' | 'joiner'

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                
                switch (message.type) {
                    case 'create_session':
                        handleCreateSession(ws, message);
                        break;
                    case 'join_session':
                        handleJoinSession(ws, message);
                        break;
                    case 'offer':
                    case 'answer':
                    case 'ice_candidate':
                        handleSignaling(ws, message, sessionId, userRole);
                        break;
                    case 'disconnect':
                        handleDisconnect(sessionId, userRole);
                        break;
                    default:
                        ws.send(JSON.stringify({ 
                            type: 'error', 
                            message: '未知消息类型' 
                        }));
                }
            } catch (error) {
                console.error('WebSocket消息处理错误:', error);
                ws.send(JSON.stringify({ 
                    type: 'error', 
                    message: '消息格式错误' 
                }));
            }
        });

        ws.on('close', () => {
            console.log('WebSocket连接关闭');
            if (sessionId && userRole) {
                handleDisconnect(sessionId, userRole);
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket错误:', error);
        });

        function handleCreateSession(ws, message) {
            sessionId = Math.random().toString(36).substring(2, 10);
            userRole = 'creator';
            
            sessions.set(sessionId, {
                creator: { ws, publicKey: message.publicKey },
                joiner: null,
                createdAt: Date.now()
            });
            
            ws.send(JSON.stringify({
                type: 'session_created',
                sessionId: sessionId
            }));
            
            console.log(`会话创建: ${sessionId}`);
        }

        function handleJoinSession(ws, message) {
            const session = sessions.get(message.sessionId);
            
            if (!session) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: '会话不存在或已过期'
                }));
                return;
            }
            
            if (session.joiner) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: '会话已满'
                }));
                return;
            }
            
            sessionId = message.sessionId;
            userRole = 'joiner';
            
            session.joiner = { ws, publicKey: message.publicKey };
            
            // 通知创建者有人加入，并交换公钥
            if (session.creator && session.creator.ws.readyState === ws.OPEN) {
                session.creator.ws.send(JSON.stringify({
                    type: 'peer_joined',
                    publicKey: message.publicKey
                }));
            }
            
            // 回复加入者创建者的公钥
            ws.send(JSON.stringify({
                type: 'session_joined',
                publicKey: session.creator.publicKey
            }));
            
            console.log(`用户加入会话: ${sessionId}`);
        }

        function handleSignaling(ws, message, sessionId, userRole) {
            if (!sessionId || !userRole) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: '未加入会话'
                }));
                return;
            }
            
            const session = sessions.get(sessionId);
            if (!session) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: '会话不存在'
                }));
                return;
            }
            
            // 转发信令消息给对端
            const peer = userRole === 'creator' ? session.joiner : session.creator;
            if (peer && peer.ws.readyState === ws.OPEN) {
                peer.ws.send(JSON.stringify(message));
            }
        }

        function handleDisconnect(sessionId, userRole) {
            if (!sessionId) return;
            
            const session = sessions.get(sessionId);
            if (!session) return;
            
            // 通知对端连接断开
            const peer = userRole === 'creator' ? session.joiner : session.creator;
            if (peer && peer.ws.readyState === ws.OPEN) {
                peer.ws.send(JSON.stringify({
                    type: 'peer_disconnected'
                }));
            }
            
            // 清理会话
            sessions.delete(sessionId);
            console.log(`会话结束: ${sessionId}`);
        }
    });

    console.log(`${Green('[✓]')} WebSocket信令服务器启动成功`);
    return wss;
};
