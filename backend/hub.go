package main

type ClientAndStream struct {
	client   *Client
	streamId string
}

type Hub struct {
	register    chan *Client
	unregister  chan *Client
	subscribe   chan ClientAndStream
	unsubscribe chan ClientAndStream
	clients     map[*Client]map[string]bool

	broadcast chan *ApiMessage
}

func NewHub() *Hub {
	return &Hub{
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		subscribe:   make(chan ClientAndStream),
		unsubscribe: make(chan ClientAndStream),
		clients:     make(map[*Client]map[string]bool),
		broadcast:   make(chan *ApiMessage),
	}
}

func (h *Hub) run() {
	for {
		select {
		case c := <-h.register:
			h.clients[c] = make(map[string]bool)

		case c := <-h.unregister:
			delete(h.clients, c)

		case cs := <-h.subscribe:
			if subscriptions, ok := h.clients[cs.client]; ok {
				subscriptions[cs.streamId] = true
				success := &ApiMessage{
					Type:     "subscribe-success",
					StreamId: cs.streamId,
				}
				cs.client.send <- success
			}

		case cs := <-h.unsubscribe:
			if subscriptions, ok := h.clients[cs.client]; ok {
				delete(subscriptions, cs.streamId)
			}

		case msg := <-h.broadcast:
			for client, subscriptions := range h.clients {
				if _, ok := subscriptions[msg.StreamId]; ok {
					client.send <- msg
				}
			}
		}
	}
}
