import { EncryptedMessage } from "./api";
import { decrypt, encrypt, generateEncryptionKey, generateSigningKeyPair, sign, verify } from "./crypto";
import { Base64 } from "js-base64";
import * as Uuid from "uuid";

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

export async function pack(producer: StreamProducer, data: BufferSource): Promise<EncryptedMessage> {
	const { streamId, encryptionKey, signingKeyPair } = producer;
	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	const encryptedData = await encrypt(encryptionKey, iv, data);

	const signature = await sign(signingKeyPair.privateKey!, encryptedData);

	return {
		streamId,
		b64Iv: Base64.fromUint8Array(new Uint8Array(iv)),
		b64Data: Base64.fromUint8Array(new Uint8Array(encryptedData)),
		b64Signature: Base64.fromUint8Array(new Uint8Array(signature)),
	};
}

export async function unpack(consumer: StreamConsumer, encryptedMessage: EncryptedMessage): Promise<ArrayBuffer> {
	const { encryptionKey, signingPublicKey } = consumer;
	const { b64Iv, b64Data, b64Signature } = encryptedMessage;

	const isValid = verify(signingPublicKey, Base64.toUint8Array(b64Signature), Base64.toUint8Array(b64Data));
	if (!isValid) {
		throw new Error("Message signature is not valid");
	}

	return decrypt(encryptionKey, Base64.toUint8Array(b64Iv), Base64.toUint8Array(b64Data));
}