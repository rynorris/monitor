/**
 * Server APIs.
 * These are used to communicate with the server.
 */
export type ApiMessage =
    | { type: "encrypted-data", encryptedData: EncryptedDataMsg }
    | { type: "subscribe", subscribe: StreamMsg }
    | { type: "unsubscribe", unsubscribe: StreamMsg }
    | { type: "subscribe-success", subscribeSuccess: StreamMsg }
    | { type: "subscribe-failure", subscribeFailure: SubscribeFailureMsg }
    | { type: "start-broadcasting", startBroadcasting: StreamMsg }
    | { type: "stop-broadcasting", stopBroadcasting: StreamMsg };

export interface StreamMsg {
    streamId: string;
}

export interface EncryptedDataMsg extends StreamMsg {
    iv: ArrayBufferView;
    data: ArrayBufferView;
    signature: ArrayBufferView;
}

export interface SubscribeFailureMsg extends StreamMsg {
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
