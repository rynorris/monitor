package main

type ApiMessage struct {
	_msgpack struct{} `msgpack:",omitempty"`

	Type string `msgpack:"type"`

	Subscribe        *StreamMsg           `msgpack:"subscribe"`
	Unsubscribe      *StreamMsg           `msgpack:"unsubscribe"`
	SubscribeSuccess *StreamMsg           `msgpack:"subscribeSuccess"`
	SubscribeFailure *SubscribeFailureMsg `msgpack:"subscribeFailure"`

	StartBroadcasting   *StreamMsg `msgpack:"startBroadcasting"`
	StopBroadcasting    *StreamMsg `msgpack:"stopBroadcasting"`
	PauseBroadcasting   *StreamMsg `msgpack:"pauseBroadcasting"`
	UnpauseBroadcasting *StreamMsg `msgpack:"unpauseBroadcasting"`

	EncryptedData *EncryptedDataMsg `msgpack:"encryptedData"`

	StreamStats *StreamStatsMsg `msgpack:"streamStats"`
}

type StreamMsg struct {
	StreamId string `msgpack:"streamId"`
}

type SubscribeFailureMsg struct {
	StreamMsg
	Reason string `msgpack:"reason"`
}

type EncryptedDataMsg struct {
	StreamMsg
	Iv        []byte `msgpack:"iv"`
	Data      []byte `msgpack:"data"`
	Signature []byte `msgpack:"signature"`
}

type StreamStatsMsg struct {
	StreamMsg
	Subscribers int `msgpack:"subscribers"`
}
