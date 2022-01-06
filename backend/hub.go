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
	PauseBroadcasting
	UnpauseBroadcasting
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
			for _, s := range h.storage.Subscriptions(c) {
				h.storage.Unsubscribe(c, s)
				h.sendStats(s)
			}
			h.storage.Unregister(c)

		case msg := <-h.control:
			switch msg.Type {
			case Subscribe:
				h.storage.Subscribe(msg.Client, msg.StreamId)
				success := &ApiMessage{
					Type: "subscribe-success",
					SubscribeSuccess: &StreamMsg{
						StreamId: msg.StreamId,
					},
				}
				msg.Client.send <- success
				h.sendStats(msg.StreamId)
			case Unsubscribe:
				h.storage.Unsubscribe(msg.Client, msg.StreamId)
				h.sendStats(msg.StreamId)

			case StartBroadcasting:
				h.storage.StartBroadcasting(msg.Client, msg.StreamId)
				h.sendStats(msg.StreamId)

			case StopBroadcasting:
				h.storage.StopBroadcasting(msg.Client, msg.StreamId)

			case PauseBroadcasting:
				h.storage.PauseBroadcasting(msg.Client, msg.StreamId)

			case UnpauseBroadcasting:
				h.storage.UnpauseBroadcasting(msg.Client, msg.StreamId)

			default:
				log.Printf("Ignoring unknown control message: %v", msg.Type)
			}

		case msg := <-h.broadcast:
			for _, client := range h.storage.Subscribers(msg.EncryptedData.StreamId) {
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

func (h *Hub) sendStats(streamId string) {
	if b := h.storage.Broadcaster(streamId); b != nil {
		b.send <- &ApiMessage{
			Type: "stream-stats",
			StreamStats: &StreamStatsMsg{
				StreamMsg: StreamMsg{
					StreamId: streamId,
				},
				Subscribers: len(h.storage.Subscribers(streamId)),
			},
		}
	}
}
