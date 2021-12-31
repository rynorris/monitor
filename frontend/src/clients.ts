import { ApiMessage, EncryptedData } from "./api";
import { decrypt, encrypt, generateEncryptionKey, generateSigningKeyPair, sign, verify } from "./crypto";
import { Base64 } from "js-base64";
import * as Uuid from "uuid";

type Handler = (data: ArrayBuffer) => void;

export class Client {
	private ws?: PersistentWebSocket;
	private subscriptions: Record<string, boolean> = {};
	private consumers: Record<string, StreamConsumer> = {};
	private producers: Record<string, StreamProducer> = {};
	private handlers: Record<string, Array<Handler>> = {};

	public connect(url: string) {
		this.ws = new PersistentWebSocket(url);
		const syncInterval = setInterval(this.synchronize, 1000);
		const stopSyncing = () => clearInterval(syncInterval);

		this.ws.onopen = this.synchronize;
		this.ws.onmessage = this.handleMessage;
		this.ws.onclose = stopSyncing;
	}

	public registerConsumer(consumer: StreamConsumer) {
		console.log(`Registering consumer ${consumer.streamId}`);
		this.consumers[consumer.streamId] = consumer;
	}

	public registerProducer(producer: StreamProducer) {
		console.log(`Registering producer ${producer.streamId}`);
		this.producers[producer.streamId] = producer;
	}

	public subscribe(streamId: string, handler: Handler) {
		if (handler != null) {
			if (this.handlers[streamId] == null) {
				this.handlers.streamId = [];
			}
			this.handlers.streamId.push(handler);
		}

		this.synchronize();
	}

	public unsubscribe(streamId: string, handler: Handler) {
		let handlers = this.handlers[streamId] ?? [];
		if (handlers != null) {
			handlers = handlers.filter(h => h !== handler);
		}

		if (handlers.length === 0) {
			delete this.handlers[streamId];
		} else {
			this.handlers[streamId] = handlers;
		}

		this.synchronize();
	}

	public async broadcast(streamId: string, data: BufferSource) {
		const producer = this.producers[streamId];
		if (producer == null) {
			throw new Error(`No producer registered with ID ${streamId}`);
		}

		const encryptedData = await pack(producer, data);
		this.sendMessage(encryptedData);
	}

	private async handleMessage(ev: MessageEvent<ApiMessage>) {
		const msg = ev.data;
		switch (msg.type) {
			case "subscribe":
				throw new Error("Received subscribe message from server");
			case "subscribe-failure":
				console.error(`Failed to subscribe to stream ${msg.streamId}: ${msg.reason}`);
				this.subscriptions[msg.streamId] = false;
				break;
			case "subscribe-success":
				console.log(`Successfully subscribed to stream ${msg.streamId}`);
				this.subscriptions[msg.streamId] = true;
				break;
			case "encrypted-data":
				const handlers = this.handlers[msg.streamId] ?? [];
				if (handlers.length === 0) {
					break;
				}

				const consumer = this.consumers[msg.streamId];
				if (consumer == null) {
					break;
				}

				const data = await unpack(consumer, msg);

				handlers.forEach(h => h(data));

				break;
		}
	}

	private synchronize() {
		// Unsubscribe from streams with no handlers.
		Object.keys(this.subscriptions).forEach(streamId => {
			const handlers = this.handlers[streamId] ?? [];
			if (handlers.length === 0) {
				console.log(`Disconnecting from stream ${streamId}`);
				// TODO: unsubscribe.

				delete this.subscriptions[streamId];
			}
		});

		// Subscribe to streams with handlers.
		Object.keys(this.handlers).forEach(streamId => {
			console.log(`Connecting to stream ${streamId}`);
			const connected = this.subscriptions[streamId] || false;

			if (!connected) {
				this.subscriptions[streamId] = false;
				this.sendMessage({ type: "subscribe", streamId });
			}
		});
	}

	private sendMessage(msg: ApiMessage) {
		const msgData = JSON.stringify(msg);
		this.ws?.send(msgData);
	}
}

class PersistentWebSocket {
	private url: string;
	private ws: WebSocket | null = null;
	public onopen: (() => void) | null = null;
	public onmessage: ((ev: MessageEvent<any>) => void) | null = null;
	public onclose: (() => void) | null = null;
	private checkInterval: ReturnType<typeof setInterval>;

	constructor(url: string) {
		this.url = url;
		this.check();
		this.checkInterval = setInterval(this.check, 1000);
	}

	public send(data: string | ArrayBufferLike | ArrayBufferView | Blob) {
		this.ws?.send(data);
	}

	public close() {
		clearTimeout(this.checkInterval);
		this.ws?.close();
		this.onclose?.();
	}

	private check() {
		if (this.ws == null) {
			const ws = new WebSocket(this.url);
			ws.onopen = this.handleOpen;
			ws.onclose = this.handleClose;
			ws.onmessage = this.handleMessage;
			this.ws = ws;
		}
	}

	private handleOpen() {
		this.onopen?.();
	}

	private handleClose() {
		this.ws = null;
	}

	private handleMessage(ev: MessageEvent<any>) {
		this.onmessage?.(ev);
	}
}

export interface Stream {
	streamId: string;
	name: string;
	encryptionKey: CryptoKey;
}

export interface StreamProducer extends Stream {
	signingKeyPair: CryptoKeyPair;
}

export interface StreamConsumer extends Stream {
	signingPublicKey: CryptoKey;
}

export async function newStream(name: string): Promise<StreamProducer> {
	const streamId = Uuid.v4();
	const [encryptionKey, signingKeyPair] = await Promise.all([
		generateEncryptionKey(),
		generateSigningKeyPair(),
	]);

	return { streamId, name, encryptionKey, signingKeyPair };
}

export async function pack(producer: StreamProducer, data: BufferSource): Promise<EncryptedData> {
	const { streamId, encryptionKey, signingKeyPair } = producer;
	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	const encryptedData = await encrypt(encryptionKey, iv, data);

	const signature = await sign(signingKeyPair.privateKey!, encryptedData);

	return {
		type: "encrypted-data",
		streamId,
		b64Iv: Base64.fromUint8Array(new Uint8Array(iv)),
		b64Data: Base64.fromUint8Array(new Uint8Array(encryptedData)),
		b64Signature: Base64.fromUint8Array(new Uint8Array(signature)),
	};
}

export async function unpack(consumer: StreamConsumer, encryptedMessage: EncryptedData): Promise<ArrayBuffer> {
	const { encryptionKey, signingPublicKey } = consumer;
	const { b64Iv, b64Data, b64Signature } = encryptedMessage;

	const isValid = verify(signingPublicKey, Base64.toUint8Array(b64Signature), Base64.toUint8Array(b64Data));
	if (!isValid) {
		throw new Error("Message signature is not valid");
	}

	return decrypt(encryptionKey, Base64.toUint8Array(b64Iv), Base64.toUint8Array(b64Data));
}