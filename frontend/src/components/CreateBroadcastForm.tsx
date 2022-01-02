import { Button, Center, Input, InputGroup, InputLeftAddon, Stack } from "@chakra-ui/react";
import React from "react";
import { useAppDispatch } from "../state/store";
import { createProducer } from "../state/thunks";

export const CreateBroadcastForm: React.FC = () => {
    const dispatch = useAppDispatch();

    const [name, setName] = React.useState("");

    const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => setName(ev.target.value);
    const onSubmit = () => {
        dispatch(createProducer(name));
    };

    return (
        <Center width="100%" height="100%">
            <Stack>
                <InputGroup>
                    <InputLeftAddon children="Stream name:" />
                    <Input placeholder="Baby monitor" onChange={handleChange} value={name} />
                </InputGroup>
                <Button
                    colorScheme="green"
                    onClick={onSubmit}
                    disabled={name.length === 0}
                >
                    Start Broadcasting
                </Button>
            </Stack>
        </Center>
    );
};