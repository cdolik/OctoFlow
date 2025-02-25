// Polyfill for TextEncoder and TextDecoder
import { TextEncoder, TextDecoder } from 'util';

// Add TransformStream polyfill needed for MSW
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = class TransformStream {
    constructor() {
      this.readable = {};
      this.writable = {};
    }
  };
}

// Add TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      const array = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        array[i] = str.charCodeAt(i);
      }
      return array;
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(arr) {
      return String.fromCharCode.apply(null, arr);
    }
  };
}
