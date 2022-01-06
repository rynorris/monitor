/**
 * Server APIs.
 * These are used to communicate with the server.
 */
export type ApiMessage =
    | { type: "encrypted-data", encryptedData: EncryptedDataMsg }
    | { type: "subscribe", subscribe: SubscribeMsg }
    | { type: "unsubscribe", unsubscribe: UnsubscribeMsg }
    | { type: "subscribe-success", subscribeSuccess: SubscribeSuccessMsg }
    | { type: "subscribe-failure", subscribeFailure: SubscribeFailureMsg };

export interface EncryptedDataMsg {
    streamId: string;
    iv: ArrayBufferView;
    data: ArrayBufferView;
    signature: ArrayBufferView;
}

export interface SubscribeMsg {
    streamId: string;
}

export interface UnsubscribeMsg {
    streamId: string;
}

export interface SubscribeSuccessMsg {
    streamId: string;
}

export interface SubscribeFailureMsg {
    streamId: string;
    reason: string;
}

/**
 * Client APIs.
 * These go inside the encrypted data messages, and are opaque to the server.
 */
export interface VideoSegment {
    type: "segment";
    timestamp: Date;
    data: ArrayBufferView;
}
