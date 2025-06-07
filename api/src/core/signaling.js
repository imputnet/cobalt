import { WebSocketServer } from 'ws';
import { Green } from '../misc/console-text.js';

export const setupSignalingServer = (httpServer) => {
    const wss = new WebSocketServer({ 
        server: httpServer,
        path: '/ws'
    });

    const sessions = new Map(); // sessionId -> { creator, joiner, createdAt }

    console.log(`${Green('[✓]')} WebSocket signaling server started successfully, listening on path: /ws`);

    // Clean up expired sessions
    setInterval(() => {
        const now = Date.now();
        for (const [sessionId, session] of sessions.entries()) {
            if (now - session.createdAt > 30 * 60 * 1000) { // 30 minutes expiration
                sessions.delete(sessionId);
                console.log(`Cleaned up expired session: ${sessionId}`);
            }
        }
    }, 5 * 60 * 1000); // Check every 5 minutes

    wss.on('connection', (ws, req) => {
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        console.log(`WebSocket connection established: ${clientIP}, URL: ${req.url}, User-Agent: ${userAgent}`);
        
        let sessionId = null;
        let userRole = null; // 'creator' | 'joiner'
        let connectionStartTime = Date.now();

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                console.log(`Received message type: ${message.type} from ${userRole || 'unknown'} in session ${sessionId || 'none'}`);
                
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
                        console.log(`Unknown message type: ${message.type}`);
                        ws.send(JSON.stringify({ 
                            type: 'error', 
                            message: 'Unknown message type' 
                        }));
                }
            } catch (error) {
                console.error(`WebSocket message processing error (sessionId: ${sessionId || 'None'}):`, error);
                ws.send(JSON.stringify({ 
                    type: 'error', 
                    message: 'Message format error' 
                }));
            }
        });

        ws.on('close', (code, reason) => {
            const connectionDuration = Date.now() - connectionStartTime;
            const reasonStr = reason ? reason.toString() : 'No reason provided';
            console.log(`WebSocket connection closed: code=${code}, reason="${reasonStr}", sessionId=${sessionId || 'None'}, role=${userRole || 'None'}, duration=${connectionDuration}ms`);
            
            if (sessionId && userRole) {
                handleDisconnect(sessionId, userRole);
            }
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error (sessionId: ${sessionId || 'None'}, role: ${userRole || 'None'}):`, error.message || error);
        });

        function handleCreateSession(ws, message) {
            console.log(`Handling create session request, existing sessionId: ${message.existingSessionId || 'None'}`);
            
            // Check if existing session ID is provided (for reconnection)
            if (message.existingSessionId) {
                const existingSession = sessions.get(message.existingSessionId);
                if (existingSession && !existingSession.creator) {
                    // Reconnect to existing session
                    sessionId = message.existingSessionId;
                    userRole = 'creator';
                    existingSession.creator = { ws, publicKey: message.publicKey };
                    
                    ws.send(JSON.stringify({
                        type: 'session_reconnected',
                        sessionId: sessionId
                    }));
                    
                    // If there's an online joiner, notify both parties to re-establish connection
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
                    
                    console.log(`Creator reconnected to session: ${sessionId}`);
                    return;
                }
            }
            
            // Create new session
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
            
            console.log(`Session created: ${sessionId}`);
        }

        function handleJoinSession(ws, message) {
            console.log(`Handling join session request for sessionId: ${message.sessionId}`);
            const session = sessions.get(message.sessionId);
            
            if (!session) {
                console.log(`Session not found: ${message.sessionId}`);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Session does not exist or has expired'
                }));
                return;
            }
            
            // Check if there's already an active joiner
            if (session.joiner && session.joiner.ws.readyState === ws.OPEN) {
                console.log(`Session full: ${message.sessionId}`);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Session is full'
                }));
                return;
            }
            
            sessionId = message.sessionId;
            userRole = 'joiner';
            
            // Set or reset joiner
            session.joiner = { ws, publicKey: message.publicKey };
            
            // Notify creator that someone joined (if creator is online)
            if (session.creator && session.creator.ws.readyState === ws.OPEN) {
                session.creator.ws.send(JSON.stringify({
                    type: 'peer_joined',
                    publicKey: message.publicKey
                }));
                
                // Reply to joiner with creator's public key
                ws.send(JSON.stringify({
                    type: 'session_joined',
                    publicKey: session.creator.publicKey
                }));
                
                console.log(`User joined session: ${sessionId}`);
            } else {
                // Creator is not online, notify joiner to wait
                ws.send(JSON.stringify({
                    type: 'waiting_for_creator',
                    message: 'Waiting for creator to reconnect'
                }));
                console.log(`Joiner online, waiting for creator: ${sessionId}`);
            }
        }

        function handleSignaling(ws, message, sessionId, userRole) {
            if (!sessionId || !userRole) {
                console.log(`Signaling error: not joined to session (sessionId: ${sessionId}, role: ${userRole})`);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Not joined to any session'
                }));
                return;
            }
            
            const session = sessions.get(sessionId);
            if (!session) {
                console.log(`Signaling error: session not found (sessionId: ${sessionId})`);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Session does not exist'
                }));
                return;
            }
            
            // Forward signaling message to peer
            const peer = userRole === 'creator' ? session.joiner : session.creator;
            if (peer && peer.ws.readyState === ws.OPEN) {
                peer.ws.send(JSON.stringify(message));
                console.log(`Signaling message forwarded: ${message.type} from ${userRole} in session ${sessionId}`);
            } else {
                console.log(`Signaling failed: peer not available (sessionId: ${sessionId}, userRole: ${userRole})`);
            }
        }

        function handleDisconnect(sessionId, userRole) {
            if (!sessionId) return;
            
            const session = sessions.get(sessionId);
            if (!session) return;
            
            // Notify peer of disconnection (but don't delete session)
            const peer = userRole === 'creator' ? session.joiner : session.creator;
            if (peer && peer.ws.readyState === ws.OPEN) {
                peer.ws.send(JSON.stringify({
                    type: 'peer_disconnected'
                }));
            }
            
            // Only clear the disconnected user, keep session structure
            if (userRole === 'creator') {
                console.log(`Creator disconnected from session: ${sessionId}`);
                session.creator = null;
            } else {
                console.log(`Joiner disconnected from session: ${sessionId}`);
                session.joiner = null;
            }
            
            // Only delete session if both parties are disconnected
            if (!session.creator && !session.joiner) {
                sessions.delete(sessionId);
                console.log(`Session ended (both parties disconnected): ${sessionId}`);
            } else {
                console.log(`Session retained, waiting for reconnection: ${sessionId}`);
            }
        }
    });

    console.log(`${Green('[✓]')} WebSocket signaling server started successfully`);
    return wss;
};
