
export async function generateEncryptionKey(): Promise<CryptoKey> {
	return crypto.subtle.generateKey(
		{
			name: "AES-GCM",
			length: 256,
		},
		true,
		["encrypt", "decrypt"],
	);
}

export async function encrypt(key: CryptoKey, iv: BufferSource, data: BufferSource): Promise<ArrayBuffer> {
	return crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv,
		},
		key,
		data,
	);
}

export async function decrypt(key: CryptoKey, iv: BufferSource, data: BufferSource): Promise<ArrayBuffer> {
	return crypto.subtle.decrypt(
		{
			name: "AES-GCM",
			iv,
		},
		key,
		data,
	);
}

export async function generateSigningKeyPair(): Promise<CryptoKeyPair> {
	return crypto.subtle.generateKey(
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		true,
		["sign", "verify"],
	);
}

export async function sign(key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
	return crypto.subtle.sign(
		{
			name: "ECDSA",
			hash: "SHA-256",
		},
		key,
		data,
	);
}

export async function verify(key: CryptoKey, signature: BufferSource, data: BufferSource): Promise<boolean> {
	return crypto.subtle.verify(
		{
			name: "ECDSA",
			hash: "SHA-256",
		},
		key,
		signature,
		data,
	);
}