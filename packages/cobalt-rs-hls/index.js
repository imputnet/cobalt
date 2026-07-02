import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// we load the compiled native binary directly for now
const { HlsParser } = require('./cobalt-rs-hls.darwin-arm64.node');

export { HlsParser };
