package main

import (
	"github.com/joeycumines/statsd"
)

const (
	NUM_CLIENTS = "num_clients"
	NUM_STREAMS = "num_streams"
)

type Metrics interface {
	NumClients(n int)
	NumStreams(n int)
}

type statsdMetrics struct {
	client *statsd.Client
}

func NewStatsdMetrics(client *statsd.Client) Metrics {
	return &statsdMetrics{client}
}

func (m *statsdMetrics) NumClients(n int) {
	m.client.Gauge(NUM_CLIENTS, n)
}

func (m *statsdMetrics) NumStreams(n int) {
	m.client.Gauge(NUM_STREAMS, n)
}
