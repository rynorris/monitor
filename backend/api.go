package main

type ApiMessage struct {
	Type string `json:"type"`

	StreamId string `json:"streamId"`

	B64Iv        string `json:"b64Iv"`
	B64Data      string `json:"b64Data"`
	B64Signature string `json:"b64Signature"`

	Reason string `json:"reason"`
}
