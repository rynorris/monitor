package main

import (
	"log"
)

type Storage interface {
	Register(client *Client)
	Unregister(client *Client)

	Subscribe(client *Client, streamId string)
	Unsubscribe(client *Client, streamId string)
	Subscribers(streamId string) []*Client
	Subscriptions(client *Client) []string

	StartBroadcasting(client *Client, streamId string)
	StopBroadcasting(client *Client, streamId string)
	PauseBroadcasting(client *Client, streamId string)
	UnpauseBroadcasting(client *Client, streamId string)

	Broadcaster(streamId string) *Client
	Broadcasting(client *Client) *string
}

type inMemoryStorage struct {
	clients map[*Client]*clientData
	streams map[string]*streamData
	metrics Metrics
}

type clientData struct {
	Subscriptions map[string]bool
	Broadcasting  *string
}

type streamData struct {
	Subscribers map[*Client]bool
	Broadcaster *Client
	Paused      bool
}

func NewInMemoryStorage(metrics Metrics) Storage {
	return &inMemoryStorage{
		clients: make(map[*Client]*clientData),
		streams: make(map[string]*streamData),
		metrics: metrics,
	}
}

func (s *inMemoryStorage) Register(client *Client) {
	s.ensureClient(client)
}

func (s *inMemoryStorage) Unregister(client *Client) {
	if data, ok := s.clients[client]; ok {
		for stream := range data.Subscriptions {
			s.Unsubscribe(client, stream)
		}

		delete(s.clients, client)
		s.metrics.NumClients(len(s.clients))
	}
}

func (s *inMemoryStorage) Subscribe(client *Client, streamId string) {
	s.ensureClient(client)
	s.ensureStream(streamId)

	s.clients[client].Subscriptions[streamId] = true
	s.streams[streamId].Subscribers[client] = true
}

func (s *inMemoryStorage) Unsubscribe(client *Client, streamId string) {
	if data, ok := s.clients[client]; ok {
		delete(data.Subscriptions, streamId)
	}

	if data, ok := s.streams[streamId]; ok {
		delete(data.Subscribers, client)
	}

	s.deleteIfEmpty(streamId)
}

func (s *inMemoryStorage) Subscriptions(client *Client) []string {
	if data, ok := s.clients[client]; ok {
		subs := make([]string, 0, len(data.Subscriptions))
		for sub := range data.Subscriptions {
			subs = append(subs, sub)
		}
		return subs
	}

	return make([]string, 0)
}

func (s *inMemoryStorage) Subscribers(streamId string) []*Client {
	if data, ok := s.streams[streamId]; ok {
		subs := make([]*Client, 0, len(data.Subscribers))
		for sub := range data.Subscribers {
			subs = append(subs, sub)
		}
		return subs
	}

	return make([]*Client, 0)
}

func (s *inMemoryStorage) StartBroadcasting(client *Client, streamId string) {
	s.ensureClient(client)
	s.ensureStream(streamId)

	s.clients[client].Broadcasting = &streamId
	s.streams[streamId].Broadcaster = client
}

func (s *inMemoryStorage) StopBroadcasting(client *Client, streamId string) {
	if data, ok := s.clients[client]; ok {
		data.Broadcasting = nil
	}

	if data, ok := s.streams[streamId]; ok {
		data.Broadcaster = nil
	}
	s.deleteIfEmpty(streamId)
}

func (s *inMemoryStorage) PauseBroadcasting(client *Client, streamId string) {
	if data, ok := s.streams[streamId]; ok {
		if data.Broadcaster != client {
			log.Printf("Client tried to pause stream %v but isn't the broadcaster!", streamId)
			return
		}

		data.Paused = true
	}
}

func (s *inMemoryStorage) UnpauseBroadcasting(client *Client, streamId string) {
	if data, ok := s.streams[streamId]; ok {
		if data.Broadcaster != client {
			log.Printf("Client tried to pause stream %v but isn't the broadcaster!", streamId)
			return
		}

		data.Paused = false
	}
}

func (s *inMemoryStorage) Broadcasting(client *Client) *string {
	if data, ok := s.clients[client]; ok {
		return data.Broadcasting
	}
	return nil
}

func (s *inMemoryStorage) Broadcaster(streamId string) *Client {
	if data, ok := s.streams[streamId]; ok {
		return data.Broadcaster
	}
	return nil
}

func (s *inMemoryStorage) ensureClient(client *Client) {
	if _, ok := s.clients[client]; !ok {
		s.clients[client] = &clientData{
			Subscriptions: make(map[string]bool),
		}
		s.metrics.NumClients(len(s.clients))
	}
}

func (s *inMemoryStorage) ensureStream(streamId string) {
	if _, ok := s.streams[streamId]; !ok {
		s.streams[streamId] = &streamData{
			Subscribers: make(map[*Client]bool),
			Paused:      false,
		}
		s.metrics.NumStreams(len(s.streams))
	}
}

func (s *inMemoryStorage) deleteIfEmpty(streamId string) {
	if data, ok := s.streams[streamId]; ok {
		if len(data.Subscribers) == 0 && data.Broadcaster == nil {
			delete(s.streams, streamId)
			s.metrics.NumStreams(len(s.streams))
		}
	}
}
