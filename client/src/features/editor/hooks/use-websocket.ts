import { useEffect, useState } from "react";

type UseWebSocketOptions = {
  onOpen: (event: Event) => void;
  onMessage: (data: Record<string, unknown>, message: MessageEvent) => void;
  onClose: (event: CloseEvent) => void;
};

function createConnection(options: UseWebSocketOptions) {
  const isHttps = location.protocol === "https:";
  const domain = "localhost:8080";
  const endpoint = "api/ws";

  const socket = new WebSocket(
    `${isHttps ? "wss:" : "ws"}://${domain}/${endpoint}`,
  );

  socket.onopen = options.onOpen;

  socket.onmessage = (message: MessageEvent) => {
    try {
      const parsed = JSON.parse(message.data);
      options.onMessage(parsed, message);
    } catch (e) {
      options.onMessage({}, message);
    }
  };

  socket.onclose = options.onClose;

  return socket;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const [socket, setSocket] = useState<null | WebSocket>(null);

  const handleConnect = () => {
    return createConnection(options);
  };

  const send = (message: Record<string, unknown>) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket?.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    const socket = handleConnect();
    setSocket(socket);
  }, []);

  return {
    socket,
    send,
  };
};
