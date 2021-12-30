
export interface EncryptedMessage {
	streamId: string;
	b64Iv: string;
	b64Data: string;
	b64Signature: string;
}