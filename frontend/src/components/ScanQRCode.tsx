import React from "react";
import { useNavigate } from "react-router-dom";
import { FrozenConsumer } from "../clients";
import { useAppDispatch } from "../state/store";
import { registerConsumer } from "../state/thunks";
import QrReader from "react-qr-reader";

export const ScanQRCode: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleScan = React.useCallback(
        (text: string | null) => {
            if (text == null) {
                return;
            }

            const frozen: FrozenConsumer = JSON.parse(text);
            dispatch(registerConsumer(frozen));
            navigate(`/watch/${frozen.streamId}`);
        },
        [dispatch, navigate]
    );

    const handleError = (err: any) =>
        console.log(`Error scanning QR code: ${err}`);

    return <QrReader onScan={handleScan} onError={handleError} />;
};
