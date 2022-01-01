import React from "react";
import { FrozenConsumer, FrozenProducer } from "../clients";
import QRCode from "qrcode";

interface Props {
	producer: FrozenProducer;
}

export const ShareQRCode: React.FC<Props> = ({ producer }) => {
	const [image, setImage] = React.useState<string>();

	React.useEffect(() => {
		(async () => {
			const consumer: FrozenConsumer = {
				name: producer.name,
				streamId: producer.streamId,
				encryptionKey: producer.encryptionKey,
				signingPublicKey: producer.signingKeyPair.publicKey,
			};
			setImage(await QRCode.toDataURL(JSON.stringify(consumer)));
		})();
	}, [producer, setImage]);

	return (
		<img src={image} alt="qr code" />
	);
};