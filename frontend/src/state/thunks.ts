import { createAsyncThunk } from "@reduxjs/toolkit";
import { FrozenConsumer, FrozenProducer, getClient, thawConsumer, thawProducer } from "../clients";
import { addConsumer } from "./consumersSlice";
import { CONSUMERS_STORAGE_KEY, load, PRODUCER_STORAGE_KEY, save } from "./persistence";
import { setProducer } from "./producerSlice";

export const bootstrapClient = createAsyncThunk(
    "client/bootstrap",
    async (_, { dispatch }) => {
        const frozenConsumers: FrozenConsumer[] = load(CONSUMERS_STORAGE_KEY, []);
        frozenConsumers.forEach(frozen => dispatch(registerConsumer(frozen)));

        const frozenProducer: FrozenProducer | undefined = load(PRODUCER_STORAGE_KEY, undefined);
        if (frozenProducer != null) {
            dispatch(registerProducer(frozenProducer));
        }
    },
)

export const registerConsumer = createAsyncThunk(
    "consumer/register",
    async (frozen: FrozenConsumer, { dispatch }) => {
        // Store in localstorage.
        const frozenConsumers: FrozenConsumer[] = load(CONSUMERS_STORAGE_KEY, []);
        const newFrozenConsumers = frozenConsumers.filter(f => f.streamId !== frozen.streamId);
        newFrozenConsumers.push(frozen);
        save(CONSUMERS_STORAGE_KEY, newFrozenConsumers);

        // Register with client.
        const thawed = await thawConsumer(frozen);
        getClient().registerConsumer(thawed);

        // Add to redux.
        dispatch(addConsumer(frozen));
    },
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
)