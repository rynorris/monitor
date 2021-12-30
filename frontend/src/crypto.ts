
export async function generateEncryptionKey(): Promise<CryptoKey> {
	return window.crypto.subtle.generateKey(
		{
			name: "AES-GCM",
			length: 256,
		},
		true,
		["encrypt", "decrypt"],
	);
}

export async function encrypt(key: CryptoKey, data: BufferSource, iv: BufferSource): Promise<ArrayBuffer> {
	return window.crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv,
		},
		key,
		data,
	);
}

export async function decrypt(key: CryptoKey, data: BufferSource, iv: BufferSource): Promise<ArrayBuffer> {
	return window.crypto.subtle.decrypt(
		{
			name: "AES-GCM",
			iv,
		},
		key,
		data,
	);
}

export async function generateSigningKeyPair(): Promise<CryptoKeyPair> {
	return window.crypto.subtle.generateKey(
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		true,
		["sign", "verify"],
	);
}

export async function sign(key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
	return window.crypto.subtle.sign(
		{
			name: "ECDSA",
		},
		key,
		data,
	);
}

export async function verify(key: CryptoKey, signature: BufferSource, data: BufferSource): Promise<boolean> {
	return window.crypto.subtle.verify(
		{
			name: "ECDSA",
		},
		key,
		signature,
		data,
	);
}