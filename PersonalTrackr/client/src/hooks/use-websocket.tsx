import { useEffect, useRef } from "react";
import { queryClient } from "@/lib/queryClient";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'table_updated':
          case 'table_created':
            queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
            break;
          case 'order_created':
          case 'order_updated':
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
            queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats/today"] });
            break;
          default:
            console.log("Unknown WebSocket message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (ws.current?.readyState === WebSocket.CLOSED) {
          // Reconnect logic could go here
        }
      }, 5000);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return ws.current;
}
