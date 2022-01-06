import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    freezeProducer,
    FrozenConsumer,
    FrozenProducer,
    getClient,
    newStream,
    thawConsumer,
    thawProducer,
} from "../clients";
import { addConsumer } from "./consumersSlice";
import {
    CONSUMERS_STORAGE_KEY,
    load,
    PRODUCER_STORAGE_KEY,
    save,
} from "./persistence";
import { setProducer } from "./producerSlice";
import { setStats } from "./statsSlice";
import { connect, disconnect } from "./statusSlice";

export const bootstrapClient = createAsyncThunk(
    "client/bootstrap",
    async (_, { dispatch }) => {
        const client = getClient();
        client.onConnect = () => dispatch(connect());
        client.onDisconnect = () => dispatch(disconnect());
        client.onStats = stats => dispatch(setStats(stats));

        const frozenConsumers: FrozenConsumer[] = load(
            CONSUMERS_STORAGE_KEY,
            []
        );
        frozenConsumers.forEach((frozen) => dispatch(registerConsumer(frozen)));

        const frozenProducer: FrozenProducer | undefined = load<
            FrozenProducer | undefined
        >(PRODUCER_STORAGE_KEY, undefined);
        if (frozenProducer != null) {
            dispatch(registerProducer(frozenProducer));
        } else {
        }
    }
);

export const createProducer = createAsyncThunk(
    "producer/create",
    async (name: string, { dispatch }) => {
        const newProducer = await newStream(name);
        dispatch(registerProducer(await freezeProducer(newProducer)));
    }
);

export const registerConsumer = createAsyncThunk(
    "consumer/register",
    async (frozen: FrozenConsumer, { dispatch }) => {
        // Store in localstorage.
        const frozenConsumers: FrozenConsumer[] = load(
            CONSUMERS_STORAGE_KEY,
            []
        );
        const newFrozenConsumers = frozenConsumers.filter(
            (f) => f.streamId !== frozen.streamId
        );
        newFrozenConsumers.push(frozen);
        save(CONSUMERS_STORAGE_KEY, newFrozenConsumers);

        // Register with client.
        const thawed = await thawConsumer(frozen);
        getClient().registerConsumer(thawed);

        // Add to redux.
        dispatch(addConsumer(frozen));
    }
);

export const registerProducer = createAsyncThunk(
    "producer/register",
    async (frozen: FrozenProducer, { dispatch }) => {
        // Store in localStorage.
        save(PRODUCER_STORAGE_KEY, frozen);

        // Register with client.
        const thawed = await thawProducer(frozen);
        getClient().registerProducer(thawed);

        // Add to redux.
        dispatch(setProducer(frozen));
    }
);
