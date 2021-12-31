
export function load<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    if (data == null) {
        return defaultValue;
    }

    return JSON.parse(data);
}

export function save<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
}