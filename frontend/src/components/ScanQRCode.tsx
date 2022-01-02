import { Html5QrcodeScanner } from "html5-qrcode";
import React from "react";
import { useNavigate } from "react-router-dom";
import { FrozenConsumer } from "../clients";
import { useAppDispatch } from "../state/store";
import { registerConsumer } from "../state/thunks";

export const ScanQRCode: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	React.useLayoutEffect(() => {
		const scanner = new Html5QrcodeScanner(
			"qrcode-reader",
			{
				fps: 10,
				qrbox: 5,
				videoConstraints: { facingMode: "environment" },
			},
			false,
		);

		const onSuccess = async (text: string) => {
			const frozen: FrozenConsumer = JSON.parse(text);
			dispatch(registerConsumer(frozen));
			navigate(`/watch/${frozen.streamId}`);
		};

		const onFailure = (err: unknown) => console.warn(`Error scanning QR Code: ${err}`);

		scanner.render(onSuccess, onFailure);

		return () => {
			scanner.clear();
		};
	}, [dispatch, navigate]);

	return (
		<div id="qrcode-reader" />
	)
};