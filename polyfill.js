import buffer from "node:buffer";
import { createRequire } from "node:module";

// Polyfill SlowBuffer for Node.js 22+ compatibility with older jsonwebtoken / jwa / buffer-equal-constant-time
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}

try {
  const require = createRequire(import.meta.url);
  const cjsBuffer = require("buffer");
  if (!cjsBuffer.SlowBuffer) {
    cjsBuffer.SlowBuffer = cjsBuffer.Buffer;
  }
} catch (e) {
  // ignore if require not available
}
