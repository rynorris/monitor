import { ApiMessage, EncryptedDataMsg } from "./api";
import {
    decrypt,
    encrypt,
    exportKey,
    generateEncryptionKey,
    generateSigningKeyPair,
    importEncryptionKey,
    importSigningKey,
    importSigningKeyPair,
    sign,
    verify,
} from "./crypto";
import * as Uuid from "uuid";
import * as Msgpack from "@msgpack/msgpack";

type Handler = (data: ArrayBuffer) => void;

type StreamStatus = "disconnected" | "pending" | "connected";

let globalClient: Client | null = null;

const HOST = window.location.host;
const WS_URL = process.env.NODE_ENV === "production" ? "wss://api.monitor.norris.dev/ws" : `wss://${HOST}/api/ws`;

export function getClient(): Client {
    if (globalClient == null) {
        globalClient = new Client();
        globalClient.connect(WS_URL);
    }

    return globalClient;
}

export class Client {
    public onConnect?: () => void;
    public onDisconnect?: () => void;

    private ws?: PersistentWebSocket;
    private streams: Record<string, StreamStatus> = {};
    private consumers: Record<string, StreamConsumer> = {};
    private producers: Record<string, StreamProducer> = {};
    private handlers: Record<string, Array<Handler>> = {};
    private syncInterval: ReturnType<typeof setInterval> | null = null;

    public connect(url: string) {
        console.log(`Connecting websocket client to: ${url}`);
        this.ws = new PersistentWebSocket(url);

        this.ws.onopen = () => {
            this.streams = {};
            this.synchronize();
            this.syncInterval = setInterval(this.synchronize.bind(this), 1000);
            this.onConnect?.();
        };
        this.ws.onmessage = this.handleMessage.bind(this);

        const stopSyncing = () =>
            this.syncInterval && clearInterval(this.syncInterval);
        this.ws.onclose = () => {
            stopSyncing();
            this.onDisconnect?.();
        };
    }

    public close() {
        this.ws?.close();
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
                this.handlers[streamId] = [];
            }
            this.handlers[streamId].push(handler);
        }

        this.synchronize();
    }

    public unsubscribe(streamId: string, handler: Handler) {
        let handlers = this.handlers[streamId] ?? [];
        if (handlers != null) {
            handlers = handlers.filter((h) => h !== handler);
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
        this.sendMessage({ type: "encrypted-data", encryptedData });
    }

    private async handleMessage(ev: MessageEvent<any>) {
        const msg = Msgpack.decode(ev.data) as ApiMessage;
        switch (msg.type) {
            case "subscribe":
                throw new Error("Received subscribe message from server");
            case "subscribe-failure":
                console.error(
                    `Failed to subscribe to stream ${msg.subscribeFailure.streamId}: ${msg.subscribeFailure.reason}`
                );
                this.streams[msg.subscribeFailure.streamId] = "disconnected";
                break;
            case "subscribe-success":
                console.log(
                    `Successfully subscribed to stream ${msg.subscribeSuccess.streamId}`
                );
                this.streams[msg.subscribeSuccess.streamId] = "connected";
                break;
            case "encrypted-data":
                const handlers = this.handlers[msg.encryptedData.streamId] ?? [];
                if (handlers.length === 0) {
                    break;
                }

                const consumer = this.consumers[msg.encryptedData.streamId];
                if (consumer == null) {
                    break;
                }

                const data = await unpack(consumer, msg.encryptedData);

                handlers.forEach((h) => h(data));

                break;
            default:
                console.log(`Ignoring unknown message of type: ${msg.type}`);
                break;
        }
    }

    private synchronize() {
        if (!this.ws?.connected) {
            return;
        }

        // Unsubscribe from streams with no handlers.
        Object.keys(this.streams).forEach((streamId) => {
            const handlers = this.handlers[streamId] ?? [];
            if (handlers.length === 0) {
                console.log(`Disconnecting from stream ${streamId}`);
                this.sendMessage({ type: "unsubscribe", unsubscribe: { streamId } });
                delete this.streams[streamId];
            }
        });

        // Subscribe to streams with handlers.
        Object.keys(this.handlers).forEach((streamId) => {
            const status = this.streams[streamId] ?? "disconnected";

            if (status === "disconnected") {
                console.log(`Connecting to stream ${streamId}`);
                this.streams[streamId] = "pending";
                this.sendMessage({ type: "subscribe", subscribe: { streamId } });
            }
        });
    }

    private sendMessage(msg: ApiMessage) {
        const msgData = Msgpack.encode(msg);
        this.ws?.send(msgData);
    }
}

class PersistentWebSocket {
    private url: string;
    private ws: WebSocket | null = null;

    public connected: boolean = false;
    public onopen: (() => void) | null = null;
    public onmessage: ((ev: MessageEvent<any>) => void) | null = null;
    public onclose: (() => void) | null = null;
    private checkInterval: ReturnType<typeof setInterval>;

    constructor(url: string) {
        this.url = url;
        this.check();
        this.checkInterval = setInterval(this.check.bind(this), 1000);
    }

    public send(data: string | ArrayBufferLike | ArrayBufferView | Blob) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }

    public close() {
        clearTimeout(this.checkInterval);
        this.ws?.close();
        this.onclose?.();
    }

    private check() {
        if (this.ws == null) {
            const ws = new WebSocket(this.url);
            ws.binaryType = "arraybuffer";
            ws.onopen = this.handleOpen.bind(this);
            ws.onclose = this.handleClose.bind(this);
            ws.onmessage = this.handleMessage.bind(this);
            this.ws = ws;
        }
    }

    private handleOpen() {
        console.log(`Websocket connected: ${this.url}`);
        this.connected = true;
        this.onopen?.();
    }

    private handleClose() {
        console.log(`Websocket disconnected: ${this.url}`);
        this.connected = false;
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

export async function pack(
    producer: StreamProducer,
    data: BufferSource,
): Promise<EncryptedDataMsg> {
    const { streamId, encryptionKey, signingKeyPair } = producer;
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await encrypt(encryptionKey, iv, data);

    const signature = await sign(signingKeyPair.privateKey!, encryptedData);

    return {
        streamId,
        iv,
        data: new Uint8Array(encryptedData),
        signature: new Uint8Array(signature),
    };
}

export async function unpack(
    consumer: StreamConsumer,
    encryptedMessage: EncryptedDataMsg,
): Promise<ArrayBuffer> {
    const { encryptionKey, signingPublicKey } = consumer;
    const { iv, data, signature } = encryptedMessage;

    const isValid = verify(
        signingPublicKey,
        signature,
        data,
    );
    if (!isValid) {
        throw new Error("Message signature is not valid");
    }

    return decrypt(
        encryptionKey,
        iv,
        data,
    );
}

export type FrozenConsumer = Omit<
    StreamConsumer,
    "encryptionKey" | "signingPublicKey"
> & {
    encryptionKey: JsonWebKey;
    signingPublicKey: JsonWebKey;
};

export async function freezeConsumer(
    consumer: StreamConsumer
): Promise<FrozenConsumer> {
    return {
        name: consumer.name,
        streamId: consumer.streamId,
        encryptionKey: await exportKey(consumer.encryptionKey),
        signingPublicKey: await exportKey(consumer.signingPublicKey),
    };
}

export async function thawConsumer(
    frozen: FrozenConsumer
): Promise<StreamConsumer> {
    const { name, streamId, encryptionKey, signingPublicKey } = frozen;

    return {
        name,
        streamId,
        encryptionKey: await importEncryptionKey(encryptionKey),
        signingPublicKey: await importSigningKey(signingPublicKey, ["verify"]),
    };
}

export type FrozenProducer = Omit<
    StreamProducer,
    "encryptionKey" | "signingKeyPair"
> & {
    encryptionKey: JsonWebKey;
    signingKeyPair: {
        publicKey: JsonWebKey;
        privateKey: JsonWebKey;
    };
};

export async function freezeProducer(
    producer: StreamProducer
): Promise<FrozenProducer> {
    return {
        name: producer.name,
        streamId: producer.streamId,
        encryptionKey: await exportKey(producer.encryptionKey),
        signingKeyPair: {
            publicKey: await exportKey(producer.signingKeyPair.publicKey!),
            privateKey: await exportKey(producer.signingKeyPair.privateKey!),
        },
    };
}

export async function thawProducer(
    frozen: FrozenProducer
): Promise<StreamProducer> {
    const { name, streamId, encryptionKey, signingKeyPair } = frozen;
    const { publicKey, privateKey } = signingKeyPair;

    return {
        name,
        streamId,
        encryptionKey: await importEncryptionKey(encryptionKey),
        signingKeyPair: await importSigningKeyPair(publicKey, privateKey),
    };
}
