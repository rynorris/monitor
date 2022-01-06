package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/vmihailenco/msgpack/v5"
)

const (
	writeWait      = 1 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = pongWait / 2
	maxMessageSize = 10 * 1024 * 1024
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan *ApiMessage
}

func (c *Client) String() string {
	return fmt.Sprintf("Client[%v]", c.conn.RemoteAddr())
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := NewClient(hub, conn)
	hub.register <- client
}

func NewClient(hub *Hub, conn *websocket.Conn) *Client {
	client := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan *ApiMessage, 1),
	}

	log.Printf("New client connected: %v", client)

	go client.readPump()
	go client.writePump()

	return client
}

func (c *Client) readPump() {
	defer func() {
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseAbnormalClosure, websocket.CloseGoingAway) {
				log.Printf("unexpected error: %v", err)
			}
			log.Printf("Client disconnected: %v", c)
			c.hub.unregister <- c
			break
		}

		msg := &ApiMessage{}
		msgpack.Unmarshal(data, msg)

		switch msg.Type {
		case "subscribe":
			c.hub.control <- &ControlMsg{
				Type:     Subscribe,
				Client:   c,
				StreamId: msg.Subscribe.StreamId,
			}

		case "unsubscribe":
			c.hub.control <- &ControlMsg{
				Type:     Unsubscribe,
				Client:   c,
				StreamId: msg.Unsubscribe.StreamId,
			}

		case "encrypted-data":
			c.hub.broadcast <- msg
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))

			if !ok {
				// Send channel was closed.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			data, err := msgpack.Marshal(msg)
			if err != nil {
				return
			}

			if err := c.conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
				log.Printf("Timed out sending message to client: %v", c)
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
