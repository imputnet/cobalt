import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let nativeBinding = null;
const { platform, arch } = process;

try {
  if (platform === 'darwin' && arch === 'arm64') {
    nativeBinding = require('./cobalt-rs-hls.darwin-arm64.node');
  } else if (platform === 'darwin' && arch === 'x64') {
    nativeBinding = require('./cobalt-rs-hls.darwin-x64.node');
  } else if (platform === 'linux' && arch === 'x64') {
    nativeBinding = require('./cobalt-rs-hls.linux-x64-gnu.node');
  } else if (platform === 'linux' && arch === 'arm64') {
    nativeBinding = require('./cobalt-rs-hls.linux-arm64-gnu.node');
  } else if (platform === 'win32' && arch === 'x64') {
    nativeBinding = require('./cobalt-rs-hls.win32-x64-msvc.node');
  } else {
    throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`);
  }
} catch (e) {
  throw new Error(`Failed to load native binding for ${platform}-${arch}: ${e.message}`);
}

export const HlsParser = nativeBinding.HlsParser;
