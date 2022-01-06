package main

import (
	"log"
)

type Hub struct {
	register   chan *Client
	unregister chan *Client

	control   chan *ControlMsg
	broadcast chan *ApiMessage

	storage Storage
}

const (
	Subscribe = iota
	Unsubscribe
	StartBroadcasting
	StopBroadcasting
)

type ControlMsg struct {
	Type     int
	Client   *Client
	StreamId string
}

func NewHub() *Hub {
	return &Hub{
		register:   make(chan *Client, 10),
		unregister: make(chan *Client, 10),
		control:    make(chan *ControlMsg, 10),
		broadcast:  make(chan *ApiMessage, 100),
		storage:    NewInMemoryStorage(),
	}
}

func (h *Hub) run() {
	for {
		select {
		case c := <-h.register:
			h.storage.Register(c)

		case c := <-h.unregister:
			h.storage.Unregister(c)

		case msg := <-h.control:
			switch msg.Type {
			case Subscribe:
				h.storage.Subscribe(msg.Client, msg.StreamId)
				success := &ApiMessage{
					Type:     "subscribe-success",
					StreamId: msg.StreamId,
				}
				msg.Client.send <- success
			case Unsubscribe:
				h.storage.Unsubscribe(msg.Client, msg.StreamId)
			}

		case msg := <-h.broadcast:
			for _, client := range h.storage.Subscribers(msg.StreamId) {
				select {
				case client.send <- msg:
					// Sent
				default:
					log.Printf("Client send channel is full: %v", client)
				}
			}
		}
	}
}
