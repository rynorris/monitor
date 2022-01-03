/**
 * Server APIs.
 * These are used to communicate with the server.
 */
export type ApiMessage =
    | EncryptedData
    | Subscribe
    | SubscribeSuccess
    | SubscribeFailure
    | Unsubscribe;

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

export interface Unsubscribe {
    type: "unsubscribe";
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

/**
 * Client APIs.
 * These go inside the encrypted data messages, and are opaque to the server.
 */
export interface VideoFrame {
    type: "frame";
    imageDataUrl: string;
}
