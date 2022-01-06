import React from "react";

export function useAsRef<T>(value: T): React.MutableRefObject<T> {
    const ref = React.useRef<T>(value);
    React.useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
}