export type ApiMessage = EncryptedData | Subscribe | SubscribeSuccess | SubscribeFailure;

export interface EncryptedData {
	type: "encrypted-data";
	streamId: string;
	b64Iv: string;
	b64Data: string;
	b64Signature: string;
}

export interface Subscribe {
	type: "subscribe";
	streamId: string;
}

export interface SubscribeSuccess {
	type: "subscribe-success";
	streamId: string;
}

export interface SubscribeFailure {
	type: "subscribe-failure";
	streamId: string;
	reason: string;
}