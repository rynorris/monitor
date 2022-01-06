package main

type ApiMessage struct {
	_msgpack struct{} `msgpack:",omitempty"`

	Type string `msgpack:"type"`

	StreamId string `msgpack:"streamId"`

	Iv        []byte `msgpack:"iv"`
	Data      []byte `msgpack:"data"`
	Signature []byte `msgpack:"signature"`

	Reason string `msgpack:"reason"`
}
