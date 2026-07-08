const cacheStore = new Map();

export default function cacheMiddleware(durationSeconds = 60) {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cached = cacheStore.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return res.status(200).json(cached.data);
    }

    // Capture the JSON response before sending it
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode === 200) {
        cacheStore.set(key, {
          data: body,
          expiresAt: Date.now() + durationSeconds * 1000,
        });
      }
      return originalJson.call(this, body);
    };

    next();
  };
}

export function clearCache(keyPrefix) {
  if (!keyPrefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.includes(keyPrefix)) {
      cacheStore.delete(key);
    }
  }
}

export function clearCacheMiddleware(prefixes) {
  return (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (Array.isArray(prefixes)) {
          prefixes.forEach(p => clearCache(p));
        } else {
          clearCache(prefixes);
        }
      }
      return originalJson.call(this, body);
    };
    next();
  };
}
