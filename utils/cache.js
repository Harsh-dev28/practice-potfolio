// Simple high-performance in-memory cache utility

const cacheStore = new Map();

const setCache = (key, data, ttlMs = 1000 * 60 * 15) => { // 15 minutes default TTL
    cacheStore.set(key, {
        data,
        expiry: Date.now() + ttlMs
    });
};

const getCache = (key) => {
    const item = cacheStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cacheStore.delete(key);
        return null;
    }
    return item.data;
};

const clearCache = (keyPattern) => {
    if (!keyPattern) {
        cacheStore.clear();
        return;
    }
    if (cacheStore.has(keyPattern)) {
        cacheStore.delete(keyPattern);
        return;
    }
    for (const key of cacheStore.keys()) {
        if (key.includes(keyPattern)) {
            cacheStore.delete(key);
        }
    }
};

module.exports = {
    setCache,
    getCache,
    clearCache
};
