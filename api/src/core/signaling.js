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
        });        function handleCreateSession(ws, message) {
            // 检查是否提供了现有会话ID（用于重连）
            if (message.existingSessionId) {
                const existingSession = sessions.get(message.existingSessionId);
                if (existingSession && !existingSession.creator) {
                    // 重连到现有会话
                    sessionId = message.existingSessionId;
                    userRole = 'creator';
                    existingSession.creator = { ws, publicKey: message.publicKey };
                    
                    ws.send(JSON.stringify({
                        type: 'session_reconnected',
                        sessionId: sessionId
                    }));
                    
                    // 如果有在线的 joiner，通知双方重新建立连接
                    if (existingSession.joiner && existingSession.joiner.ws.readyState === ws.OPEN) {
                        existingSession.joiner.ws.send(JSON.stringify({
                            type: 'creator_reconnected',
                            publicKey: message.publicKey
                        }));
                        
                        ws.send(JSON.stringify({
                            type: 'peer_already_joined',
                            publicKey: existingSession.joiner.publicKey
                        }));
                    }
                    
                    console.log(`创建者重连会话: ${sessionId}`);
                    return;
                }
            }
            
            // 创建新会话
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
        }function handleJoinSession(ws, message) {
            const session = sessions.get(message.sessionId);
            
            if (!session) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: '会话不存在或已过期'
                }));
                return;
            }
            
            // 检查是否已有活跃的 joiner
            if (session.joiner && session.joiner.ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: '会话已满'
                }));
                return;
            }
            
            sessionId = message.sessionId;
            userRole = 'joiner';
            
            // 设置或重新设置 joiner
            session.joiner = { ws, publicKey: message.publicKey };
            
            // 通知创建者有人加入（如果创建者在线）
            if (session.creator && session.creator.ws.readyState === ws.OPEN) {
                session.creator.ws.send(JSON.stringify({
                    type: 'peer_joined',
                    publicKey: message.publicKey
                }));
                
                // 回复加入者创建者的公钥
                ws.send(JSON.stringify({
                    type: 'session_joined',
                    publicKey: session.creator.publicKey
                }));
                
                console.log(`用户重连到会话: ${sessionId}`);
            } else {
                // 创建者不在线，通知加入者等待
                ws.send(JSON.stringify({
                    type: 'waiting_for_creator',
                    message: '等待创建者重新连接'
                }));
                console.log(`加入者在线，等待创建者: ${sessionId}`);
            }
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
        }        function handleDisconnect(sessionId, userRole) {
            if (!sessionId) return;
            
            const session = sessions.get(sessionId);
            if (!session) return;
            
            // 通知对端连接断开（但不删除会话）
            const peer = userRole === 'creator' ? session.joiner : session.creator;
            if (peer && peer.ws.readyState === ws.OPEN) {
                peer.ws.send(JSON.stringify({
                    type: 'peer_disconnected'
                }));
            }
            
            // 只清理断开的用户，保留会话结构
            if (userRole === 'creator') {
                console.log(`创建者断开连接: ${sessionId}`);
                session.creator = null;
            } else {
                console.log(`加入者断开连接: ${sessionId}`);
                session.joiner = null;
            }
            
            // 如果双方都断开，才删除会话
            if (!session.creator && !session.joiner) {
                sessions.delete(sessionId);
                console.log(`会话结束（双方都断开）: ${sessionId}`);
            } else {
                console.log(`会话保留，等待重连: ${sessionId}`);
            }
        }
    });

    console.log(`${Green('[✓]')} WebSocket信令服务器启动成功`);
    return wss;
};
