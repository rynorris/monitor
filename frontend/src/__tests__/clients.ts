import { newStream, pack, unpack } from "../clients";

describe("Message Packing", () => {
	it("can generate a new stream", async () => {
		const stream = await newStream("Test");
		expect(stream.name).toStrictEqual("Test");
		expect(stream.signingKeyPair.privateKey).toBeDefined();
		expect(stream.signingKeyPair.publicKey).toBeDefined();
	});

	it("should round-trip messages properly", async () => {
		const stream = await newStream("Test");
		const msg = "This is a test message";

		const enc = new TextEncoder();
		const msgData = enc.encode(msg);
		const encryptedMessage = await pack(stream, msgData);

		const consumer = {
			...stream,
			signingPublicKey: stream.signingKeyPair.publicKey!,
		};
		const unpackedMessage = await unpack(consumer, encryptedMessage);
		const dec = new TextDecoder();
		const roundTripMessage = dec.decode(unpackedMessage);

		expect(roundTripMessage).toStrictEqual(msg);
	});
});