package main

type ApiMessage struct {
	_msgpack struct{} `msgpack:",omitempty"`

	Type string `msgpack:"type"`

	Subscribe        *SubscribeMsg        `msgpack:"subscribe"`
	Unsubscribe      *UnsubscribeMsg      `msgpack:"unsubscribe"`
	SubscribeSuccess *SubscribeSuccessMsg `msgpack:"subscribeSuccess"`
	SubscribeFailure *SubscribeFailureMsg `msgpack:"subscribeFailure"`
	EncryptedData    *EncryptedDataMsg    `msgpack:"encryptedData"`
}

type SubscribeMsg struct {
	StreamId string `msgpack:"streamId"`
}

type UnsubscribeMsg struct {
	StreamId string `msgpack:"streamId"`
}

type SubscribeSuccessMsg struct {
	StreamId string `msgpack:"streamId"`
}

type SubscribeFailureMsg struct {
	StreamId string `msgpack:"streamId"`
	Reason   string `msgpack:"reason"`
}

type EncryptedDataMsg struct {
	StreamId  string `msgpack:"streamId"`
	Iv        []byte `msgpack:"iv"`
	Data      []byte `msgpack:"data"`
	Signature []byte `msgpack:"signature"`
}
