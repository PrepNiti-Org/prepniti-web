import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { ChatMessage } from "../chat_api";

interface UseChatSocketProps {
    onMessageReceived: (message: ChatMessage) => void;
    onTypingReceived?: (event: { room_id: string; user_id: string; username: string; is_typing: boolean }) => void;
    onReadReceiptReceived?: (event: { room_id: string; user_id: string; last_read_message_id: number }) => void;
}

export function useChatSocket({ onMessageReceived, onTypingReceived, onReadReceiptReceived }: UseChatSocketProps) {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(onMessageReceived);
    const onTypingReceivedRef = useRef(onTypingReceived);
    const onReadReceiptReceivedRef = useRef(onReadReceiptReceived);
    const isActiveRef = useRef(false);

    useEffect(() => {
        callbackRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        onTypingReceivedRef.current = onTypingReceived;
    }, [onTypingReceived]);

    useEffect(() => {
        onReadReceiptReceivedRef.current = onReadReceiptReceived;
    }, [onReadReceiptReceived]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // StrictMode-safe: use a ref so async callbacks can always check
        // whether THIS effect instance is still alive.
        isActiveRef.current = true;

        function cleanup() {
            isActiveRef.current = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            if (socketRef.current) {
                // Remove handlers before closing so onclose doesn't trigger reconnect
                const s = socketRef.current;
                s.onopen = null;
                s.onmessage = null;
                s.onerror = null;
                s.onclose = null;
                s.close();
                socketRef.current = null;
            }

            setIsConnected(false);
        }

        async function connect() {
            // Already have an open socket — nothing to do
            if (socketRef.current?.readyState === WebSocket.OPEN ||
                socketRef.current?.readyState === WebSocket.CONNECTING) return;

            if (!isActiveRef.current) return;

            try {
                // Fetch a short-lived ticket via the Next.js proxy (cookie is forwarded automatically)
                const res = await api.get<{ ticket: string }>("/chat/ws-ticket");
                const ticket = res.data.ticket;

                // Guard: component may have unmounted during the async ticket fetch
                if (!isActiveRef.current) return;

                const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                // Connect directly to port 8080 (same process that generated the ticket).
                // In production, override via NEXT_PUBLIC_WS_URL.
                const wsBase = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//localhost:8080`;
                const wsUrl = `${wsBase}/api/chat/ws?ticket=${encodeURIComponent(ticket)}`;

                console.log("[WS] Connecting to:", wsUrl);
                const socket = new WebSocket(wsUrl);
                socketRef.current = socket;

                socket.onopen = () => {
                    if (!isActiveRef.current) {
                        socket.close();
                        return;
                    }
                    console.log("[WS] Connected.");
                    setIsConnected(true);
                };

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === "typing") {
                            if (onTypingReceivedRef.current) onTypingReceivedRef.current(data);
                        } else if (data.type === "read_receipt") {
                            if (onReadReceiptReceivedRef.current) onReadReceiptReceivedRef.current(data);
                        } else {
                            // Standard chat message
                            callbackRef.current(data);
                        }
                    } catch (err) {
                        console.error("[WS] Failed to parse message:", err);
                    }
                };

                socket.onerror = (err) => {
                    console.error("[WS] WebSocket error:", err);
                };

                socket.onclose = (evt) => {
                    console.log("[WS] Closed. code:", evt.code, "reason:", evt.reason);
                    socketRef.current = null;
                    setIsConnected(false);

                    if (isActiveRef.current) {
                        console.log("[WS] Reconnecting in 3s...");
                        reconnectTimeoutRef.current = setTimeout(connect, 3000);
                    }
                };

            } catch (err) {
                console.error("[WS] Failed to fetch ticket:", err);

                if (isActiveRef.current) {
                    reconnectTimeoutRef.current = setTimeout(connect, 5000);
                }
            }
        }

        connect();

        return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sendTypingState = (roomId: string, isTyping: boolean) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "typing",
                room_id: roomId,
                is_typing: isTyping
            }));
        }
    };

    return { isConnected, sendTypingState };
}
