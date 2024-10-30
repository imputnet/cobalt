import { env } from '../config.js';

let _export;
if (env.redisURL) {
    _export = await import('./redis-store.js');
} else {
    _export = await import('./memory-store.js');
}

export default _export.default;
