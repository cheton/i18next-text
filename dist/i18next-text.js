/**
 * i18next-text - Using i18next translations without having the `key` as strings, you do not need to worry about i18n key naming.
 * Cheton Wu <cheton@gmail.com>
 * Version 0.5.6
 * MIT Licensed
 */
(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})({
    1: [ function(require, module, exports) {
        (function(root, factory) {
            if (typeof window !== "undefined") {
                root = window;
                root.i18nText = root.i18nText || {};
                root.i18nText.hash = root.i18nText.hash || {};
                factory(exports = root.i18nText.hash);
            } else {
                factory(exports);
            }
        })(this, function(exports) {
            exports.crc32 = require("./crc32");
            exports.md5 = require("./md5");
            exports.sha1 = require("./sha1");
            return exports;
        });
    }, {
        "./crc32": 2,
        "./md5": 3,
        "./sha1": 4
    } ],
    2: [ function(require, module, exports) {
        var crc32 = require("crc-32");
        var pad = function(n, width, z) {
            z = z || "0";
            n = n + "";
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        };
        module.exports = function(str) {
            var checksum = crc32.str(str);
            // convert to 2's complement hex
            return pad((checksum >>> 0).toString(16), 8);
        };
    }, {
        "crc-32": 9
    } ],
    3: [ function(require, module, exports) {
        module.exports = require("md5");
    }, {
        md5: 10
    } ],
    4: [ function(require, module, exports) {
        module.exports = require("sha1");
    }, {
        sha1: 16
    } ],
    5: [ function(require, module, exports) {
        (function(global) {
            /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
            /* eslint-disable no-proto */
            var base64 = require("base64-js");
            var ieee754 = require("ieee754");
            var isArray = require("isarray");
            exports.Buffer = Buffer;
            exports.SlowBuffer = SlowBuffer;
            exports.INSPECT_MAX_BYTES = 50;
            Buffer.poolSize = 8192;
            // not used by this implementation
            var rootParent = {};
            /**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
            Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
            function typedArraySupport() {
                function Bar() {}
                try {
                    var arr = new Uint8Array(1);
                    arr.foo = function() {
                        return 42;
                    };
                    arr.constructor = Bar;
                    // typed array instances can be augmented
                    // constructor can be set
                    // chrome 9-10 lack `subarray`
                    return arr.foo() === 42 && arr.constructor === Bar && typeof arr.subarray === "function" && arr.subarray(1, 1).byteLength === 0;
                } catch (e) {
                    return false;
                }
            }
            function kMaxLength() {
                return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
            }
            /**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
            function Buffer(arg) {
                if (!(this instanceof Buffer)) {
                    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
                    if (arguments.length > 1) return new Buffer(arg, arguments[1]);
                    return new Buffer(arg);
                }
                this.length = 0;
                this.parent = undefined;
                // Common case.
                if (typeof arg === "number") {
                    return fromNumber(this, arg);
                }
                // Slightly less common case.
                if (typeof arg === "string") {
                    return fromString(this, arg, arguments.length > 1 ? arguments[1] : "utf8");
                }
                // Unusual.
                return fromObject(this, arg);
            }
            function fromNumber(that, length) {
                that = allocate(that, length < 0 ? 0 : checked(length) | 0);
                if (!Buffer.TYPED_ARRAY_SUPPORT) {
                    for (var i = 0; i < length; i++) {
                        that[i] = 0;
                    }
                }
                return that;
            }
            function fromString(that, string, encoding) {
                if (typeof encoding !== "string" || encoding === "") encoding = "utf8";
                // Assumption: byteLength() return value is always < kMaxLength.
                var length = byteLength(string, encoding) | 0;
                that = allocate(that, length);
                that.write(string, encoding);
                return that;
            }
            function fromObject(that, object) {
                if (Buffer.isBuffer(object)) return fromBuffer(that, object);
                if (isArray(object)) return fromArray(that, object);
                if (object == null) {
                    throw new TypeError("must start with number, buffer, array or string");
                }
                if (typeof ArrayBuffer !== "undefined") {
                    if (object.buffer instanceof ArrayBuffer) {
                        return fromTypedArray(that, object);
                    }
                    if (object instanceof ArrayBuffer) {
                        return fromArrayBuffer(that, object);
                    }
                }
                if (object.length) return fromArrayLike(that, object);
                return fromJsonObject(that, object);
            }
            function fromBuffer(that, buffer) {
                var length = checked(buffer.length) | 0;
                that = allocate(that, length);
                buffer.copy(that, 0, 0, length);
                return that;
            }
            function fromArray(that, array) {
                var length = checked(array.length) | 0;
                that = allocate(that, length);
                for (var i = 0; i < length; i += 1) {
                    that[i] = array[i] & 255;
                }
                return that;
            }
            // Duplicate of fromArray() to keep fromArray() monomorphic.
            function fromTypedArray(that, array) {
                var length = checked(array.length) | 0;
                that = allocate(that, length);
                // Truncating the elements is probably not what people expect from typed
                // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
                // of the old Buffer constructor.
                for (var i = 0; i < length; i += 1) {
                    that[i] = array[i] & 255;
                }
                return that;
            }
            function fromArrayBuffer(that, array) {
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    // Return an augmented `Uint8Array` instance, for best performance
                    array.byteLength;
                    that = Buffer._augment(new Uint8Array(array));
                } else {
                    // Fallback: Return an object instance of the Buffer class
                    that = fromTypedArray(that, new Uint8Array(array));
                }
                return that;
            }
            function fromArrayLike(that, array) {
                var length = checked(array.length) | 0;
                that = allocate(that, length);
                for (var i = 0; i < length; i += 1) {
                    that[i] = array[i] & 255;
                }
                return that;
            }
            // Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
            // Returns a zero-length buffer for inputs that don't conform to the spec.
            function fromJsonObject(that, object) {
                var array;
                var length = 0;
                if (object.type === "Buffer" && isArray(object.data)) {
                    array = object.data;
                    length = checked(array.length) | 0;
                }
                that = allocate(that, length);
                for (var i = 0; i < length; i += 1) {
                    that[i] = array[i] & 255;
                }
                return that;
            }
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                Buffer.prototype.__proto__ = Uint8Array.prototype;
                Buffer.__proto__ = Uint8Array;
            }
            function allocate(that, length) {
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    // Return an augmented `Uint8Array` instance, for best performance
                    that = Buffer._augment(new Uint8Array(length));
                    that.__proto__ = Buffer.prototype;
                } else {
                    // Fallback: Return an object instance of the Buffer class
                    that.length = length;
                    that._isBuffer = true;
                }
                var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1;
                if (fromPool) that.parent = rootParent;
                return that;
            }
            function checked(length) {
                // Note: cannot use `length < kMaxLength` here because that fails when
                // length is NaN (which is otherwise coerced to zero.)
                if (length >= kMaxLength()) {
                    throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + kMaxLength().toString(16) + " bytes");
                }
                return length | 0;
            }
            function SlowBuffer(subject, encoding) {
                if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding);
                var buf = new Buffer(subject, encoding);
                delete buf.parent;
                return buf;
            }
            Buffer.isBuffer = function isBuffer(b) {
                return !!(b != null && b._isBuffer);
            };
            Buffer.compare = function compare(a, b) {
                if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                    throw new TypeError("Arguments must be Buffers");
                }
                if (a === b) return 0;
                var x = a.length;
                var y = b.length;
                var i = 0;
                var len = Math.min(x, y);
                while (i < len) {
                    if (a[i] !== b[i]) break;
                    ++i;
                }
                if (i !== len) {
                    x = a[i];
                    y = b[i];
                }
                if (x < y) return -1;
                if (y < x) return 1;
                return 0;
            };
            Buffer.isEncoding = function isEncoding(encoding) {
                switch (String(encoding).toLowerCase()) {
                  case "hex":
                  case "utf8":
                  case "utf-8":
                  case "ascii":
                  case "binary":
                  case "base64":
                  case "raw":
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return true;

                  default:
                    return false;
                }
            };
            Buffer.concat = function concat(list, length) {
                if (!isArray(list)) throw new TypeError("list argument must be an Array of Buffers.");
                if (list.length === 0) {
                    return new Buffer(0);
                }
                var i;
                if (length === undefined) {
                    length = 0;
                    for (i = 0; i < list.length; i++) {
                        length += list[i].length;
                    }
                }
                var buf = new Buffer(length);
                var pos = 0;
                for (i = 0; i < list.length; i++) {
                    var item = list[i];
                    item.copy(buf, pos);
                    pos += item.length;
                }
                return buf;
            };
            function byteLength(string, encoding) {
                if (typeof string !== "string") string = "" + string;
                var len = string.length;
                if (len === 0) return 0;
                // Use a for loop to avoid recursion
                var loweredCase = false;
                for (;;) {
                    switch (encoding) {
                      case "ascii":
                      case "binary":
                      // Deprecated
                        case "raw":
                      case "raws":
                        return len;

                      case "utf8":
                      case "utf-8":
                        return utf8ToBytes(string).length;

                      case "ucs2":
                      case "ucs-2":
                      case "utf16le":
                      case "utf-16le":
                        return len * 2;

                      case "hex":
                        return len >>> 1;

                      case "base64":
                        return base64ToBytes(string).length;

                      default:
                        if (loweredCase) return utf8ToBytes(string).length;
                        // assume utf8
                        encoding = ("" + encoding).toLowerCase();
                        loweredCase = true;
                    }
                }
            }
            Buffer.byteLength = byteLength;
            // pre-set for values that may exist in the future
            Buffer.prototype.length = undefined;
            Buffer.prototype.parent = undefined;
            function slowToString(encoding, start, end) {
                var loweredCase = false;
                start = start | 0;
                end = end === undefined || end === Infinity ? this.length : end | 0;
                if (!encoding) encoding = "utf8";
                if (start < 0) start = 0;
                if (end > this.length) end = this.length;
                if (end <= start) return "";
                while (true) {
                    switch (encoding) {
                      case "hex":
                        return hexSlice(this, start, end);

                      case "utf8":
                      case "utf-8":
                        return utf8Slice(this, start, end);

                      case "ascii":
                        return asciiSlice(this, start, end);

                      case "binary":
                        return binarySlice(this, start, end);

                      case "base64":
                        return base64Slice(this, start, end);

                      case "ucs2":
                      case "ucs-2":
                      case "utf16le":
                      case "utf-16le":
                        return utf16leSlice(this, start, end);

                      default:
                        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                        encoding = (encoding + "").toLowerCase();
                        loweredCase = true;
                    }
                }
            }
            Buffer.prototype.toString = function toString() {
                var length = this.length | 0;
                if (length === 0) return "";
                if (arguments.length === 0) return utf8Slice(this, 0, length);
                return slowToString.apply(this, arguments);
            };
            Buffer.prototype.equals = function equals(b) {
                if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                if (this === b) return true;
                return Buffer.compare(this, b) === 0;
            };
            Buffer.prototype.inspect = function inspect() {
                var str = "";
                var max = exports.INSPECT_MAX_BYTES;
                if (this.length > 0) {
                    str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
                    if (this.length > max) str += " ... ";
                }
                return "<Buffer " + str + ">";
            };
            Buffer.prototype.compare = function compare(b) {
                if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                if (this === b) return 0;
                return Buffer.compare(this, b);
            };
            Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
                if (byteOffset > 2147483647) byteOffset = 2147483647; else if (byteOffset < -2147483648) byteOffset = -2147483648;
                byteOffset >>= 0;
                if (this.length === 0) return -1;
                if (byteOffset >= this.length) return -1;
                // Negative offsets start from the end of the buffer
                if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0);
                if (typeof val === "string") {
                    if (val.length === 0) return -1;
                    // special case: looking for empty string always fails
                    return String.prototype.indexOf.call(this, val, byteOffset);
                }
                if (Buffer.isBuffer(val)) {
                    return arrayIndexOf(this, val, byteOffset);
                }
                if (typeof val === "number") {
                    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === "function") {
                        return Uint8Array.prototype.indexOf.call(this, val, byteOffset);
                    }
                    return arrayIndexOf(this, [ val ], byteOffset);
                }
                function arrayIndexOf(arr, val, byteOffset) {
                    var foundIndex = -1;
                    for (var i = 0; byteOffset + i < arr.length; i++) {
                        if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
                            if (foundIndex === -1) foundIndex = i;
                            if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex;
                        } else {
                            foundIndex = -1;
                        }
                    }
                    return -1;
                }
                throw new TypeError("val must be string, number or Buffer");
            };
            // `get` is deprecated
            Buffer.prototype.get = function get(offset) {
                console.log(".get() is deprecated. Access using array indexes instead.");
                return this.readUInt8(offset);
            };
            // `set` is deprecated
            Buffer.prototype.set = function set(v, offset) {
                console.log(".set() is deprecated. Access using array indexes instead.");
                return this.writeUInt8(v, offset);
            };
            function hexWrite(buf, string, offset, length) {
                offset = Number(offset) || 0;
                var remaining = buf.length - offset;
                if (!length) {
                    length = remaining;
                } else {
                    length = Number(length);
                    if (length > remaining) {
                        length = remaining;
                    }
                }
                // must be an even number of digits
                var strLen = string.length;
                if (strLen % 2 !== 0) throw new Error("Invalid hex string");
                if (length > strLen / 2) {
                    length = strLen / 2;
                }
                for (var i = 0; i < length; i++) {
                    var parsed = parseInt(string.substr(i * 2, 2), 16);
                    if (isNaN(parsed)) throw new Error("Invalid hex string");
                    buf[offset + i] = parsed;
                }
                return i;
            }
            function utf8Write(buf, string, offset, length) {
                return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
            }
            function asciiWrite(buf, string, offset, length) {
                return blitBuffer(asciiToBytes(string), buf, offset, length);
            }
            function binaryWrite(buf, string, offset, length) {
                return asciiWrite(buf, string, offset, length);
            }
            function base64Write(buf, string, offset, length) {
                return blitBuffer(base64ToBytes(string), buf, offset, length);
            }
            function ucs2Write(buf, string, offset, length) {
                return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
            }
            Buffer.prototype.write = function write(string, offset, length, encoding) {
                // Buffer#write(string)
                if (offset === undefined) {
                    encoding = "utf8";
                    length = this.length;
                    offset = 0;
                } else if (length === undefined && typeof offset === "string") {
                    encoding = offset;
                    length = this.length;
                    offset = 0;
                } else if (isFinite(offset)) {
                    offset = offset | 0;
                    if (isFinite(length)) {
                        length = length | 0;
                        if (encoding === undefined) encoding = "utf8";
                    } else {
                        encoding = length;
                        length = undefined;
                    }
                } else {
                    var swap = encoding;
                    encoding = offset;
                    offset = length | 0;
                    length = swap;
                }
                var remaining = this.length - offset;
                if (length === undefined || length > remaining) length = remaining;
                if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
                    throw new RangeError("attempt to write outside buffer bounds");
                }
                if (!encoding) encoding = "utf8";
                var loweredCase = false;
                for (;;) {
                    switch (encoding) {
                      case "hex":
                        return hexWrite(this, string, offset, length);

                      case "utf8":
                      case "utf-8":
                        return utf8Write(this, string, offset, length);

                      case "ascii":
                        return asciiWrite(this, string, offset, length);

                      case "binary":
                        return binaryWrite(this, string, offset, length);

                      case "base64":
                        // Warning: maxLength not taken into account in base64Write
                        return base64Write(this, string, offset, length);

                      case "ucs2":
                      case "ucs-2":
                      case "utf16le":
                      case "utf-16le":
                        return ucs2Write(this, string, offset, length);

                      default:
                        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                        encoding = ("" + encoding).toLowerCase();
                        loweredCase = true;
                    }
                }
            };
            Buffer.prototype.toJSON = function toJSON() {
                return {
                    type: "Buffer",
                    data: Array.prototype.slice.call(this._arr || this, 0)
                };
            };
            function base64Slice(buf, start, end) {
                if (start === 0 && end === buf.length) {
                    return base64.fromByteArray(buf);
                } else {
                    return base64.fromByteArray(buf.slice(start, end));
                }
            }
            function utf8Slice(buf, start, end) {
                end = Math.min(buf.length, end);
                var res = [];
                var i = start;
                while (i < end) {
                    var firstByte = buf[i];
                    var codePoint = null;
                    var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
                    if (i + bytesPerSequence <= end) {
                        var secondByte, thirdByte, fourthByte, tempCodePoint;
                        switch (bytesPerSequence) {
                          case 1:
                            if (firstByte < 128) {
                                codePoint = firstByte;
                            }
                            break;

                          case 2:
                            secondByte = buf[i + 1];
                            if ((secondByte & 192) === 128) {
                                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                                if (tempCodePoint > 127) {
                                    codePoint = tempCodePoint;
                                }
                            }
                            break;

                          case 3:
                            secondByte = buf[i + 1];
                            thirdByte = buf[i + 2];
                            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                                    codePoint = tempCodePoint;
                                }
                            }
                            break;

                          case 4:
                            secondByte = buf[i + 1];
                            thirdByte = buf[i + 2];
                            fourthByte = buf[i + 3];
                            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                                    codePoint = tempCodePoint;
                                }
                            }
                        }
                    }
                    if (codePoint === null) {
                        // we did not generate a valid codePoint so insert a
                        // replacement char (U+FFFD) and advance only 1 byte
                        codePoint = 65533;
                        bytesPerSequence = 1;
                    } else if (codePoint > 65535) {
                        // encode to utf16 (surrogate pair dance)
                        codePoint -= 65536;
                        res.push(codePoint >>> 10 & 1023 | 55296);
                        codePoint = 56320 | codePoint & 1023;
                    }
                    res.push(codePoint);
                    i += bytesPerSequence;
                }
                return decodeCodePointsArray(res);
            }
            // Based on http://stackoverflow.com/a/22747272/680742, the browser with
            // the lowest limit is Chrome, with 0x10000 args.
            // We go 1 magnitude less, for safety
            var MAX_ARGUMENTS_LENGTH = 4096;
            function decodeCodePointsArray(codePoints) {
                var len = codePoints.length;
                if (len <= MAX_ARGUMENTS_LENGTH) {
                    return String.fromCharCode.apply(String, codePoints);
                }
                // Decode in chunks to avoid "call stack size exceeded".
                var res = "";
                var i = 0;
                while (i < len) {
                    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
                }
                return res;
            }
            function asciiSlice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; i++) {
                    ret += String.fromCharCode(buf[i] & 127);
                }
                return ret;
            }
            function binarySlice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; i++) {
                    ret += String.fromCharCode(buf[i]);
                }
                return ret;
            }
            function hexSlice(buf, start, end) {
                var len = buf.length;
                if (!start || start < 0) start = 0;
                if (!end || end < 0 || end > len) end = len;
                var out = "";
                for (var i = start; i < end; i++) {
                    out += toHex(buf[i]);
                }
                return out;
            }
            function utf16leSlice(buf, start, end) {
                var bytes = buf.slice(start, end);
                var res = "";
                for (var i = 0; i < bytes.length; i += 2) {
                    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
                }
                return res;
            }
            Buffer.prototype.slice = function slice(start, end) {
                var len = this.length;
                start = ~~start;
                end = end === undefined ? len : ~~end;
                if (start < 0) {
                    start += len;
                    if (start < 0) start = 0;
                } else if (start > len) {
                    start = len;
                }
                if (end < 0) {
                    end += len;
                    if (end < 0) end = 0;
                } else if (end > len) {
                    end = len;
                }
                if (end < start) end = start;
                var newBuf;
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    newBuf = Buffer._augment(this.subarray(start, end));
                } else {
                    var sliceLen = end - start;
                    newBuf = new Buffer(sliceLen, undefined);
                    for (var i = 0; i < sliceLen; i++) {
                        newBuf[i] = this[i + start];
                    }
                }
                if (newBuf.length) newBuf.parent = this.parent || this;
                return newBuf;
            };
            /*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
            function checkOffset(offset, ext, length) {
                if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
                if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
            }
            Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var val = this[offset];
                var mul = 1;
                var i = 0;
                while (++i < byteLength && (mul *= 256)) {
                    val += this[offset + i] * mul;
                }
                return val;
            };
            Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) {
                    checkOffset(offset, byteLength, this.length);
                }
                var val = this[offset + --byteLength];
                var mul = 1;
                while (byteLength > 0 && (mul *= 256)) {
                    val += this[offset + --byteLength] * mul;
                }
                return val;
            };
            Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 1, this.length);
                return this[offset];
            };
            Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                return this[offset] | this[offset + 1] << 8;
            };
            Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                return this[offset] << 8 | this[offset + 1];
            };
            Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
            };
            Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
            };
            Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var val = this[offset];
                var mul = 1;
                var i = 0;
                while (++i < byteLength && (mul *= 256)) {
                    val += this[offset + i] * mul;
                }
                mul *= 128;
                if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                return val;
            };
            Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var i = byteLength;
                var mul = 1;
                var val = this[offset + --i];
                while (i > 0 && (mul *= 256)) {
                    val += this[offset + --i] * mul;
                }
                mul *= 128;
                if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                return val;
            };
            Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 1, this.length);
                if (!(this[offset] & 128)) return this[offset];
                return (255 - this[offset] + 1) * -1;
            };
            Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                var val = this[offset] | this[offset + 1] << 8;
                return val & 32768 ? val | 4294901760 : val;
            };
            Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                var val = this[offset + 1] | this[offset] << 8;
                return val & 32768 ? val | 4294901760 : val;
            };
            Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
            };
            Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
            };
            Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return ieee754.read(this, offset, true, 23, 4);
            };
            Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return ieee754.read(this, offset, false, 23, 4);
            };
            Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 8, this.length);
                return ieee754.read(this, offset, true, 52, 8);
            };
            Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 8, this.length);
                return ieee754.read(this, offset, false, 52, 8);
            };
            function checkInt(buf, value, offset, ext, max, min) {
                if (!Buffer.isBuffer(buf)) throw new TypeError("buffer must be a Buffer instance");
                if (value > max || value < min) throw new RangeError("value is out of bounds");
                if (offset + ext > buf.length) throw new RangeError("index out of range");
            }
            Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
                var mul = 1;
                var i = 0;
                this[offset] = value & 255;
                while (++i < byteLength && (mul *= 256)) {
                    this[offset + i] = value / mul & 255;
                }
                return offset + byteLength;
            };
            Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
                var i = byteLength - 1;
                var mul = 1;
                this[offset + i] = value & 255;
                while (--i >= 0 && (mul *= 256)) {
                    this[offset + i] = value / mul & 255;
                }
                return offset + byteLength;
            };
            Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
                if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                this[offset] = value & 255;
                return offset + 1;
            };
            function objectWriteUInt16(buf, value, offset, littleEndian) {
                if (value < 0) value = 65535 + value + 1;
                for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
                    buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
                }
            }
            Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value & 255;
                    this[offset + 1] = value >>> 8;
                } else {
                    objectWriteUInt16(this, value, offset, true);
                }
                return offset + 2;
            };
            Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 8;
                    this[offset + 1] = value & 255;
                } else {
                    objectWriteUInt16(this, value, offset, false);
                }
                return offset + 2;
            };
            function objectWriteUInt32(buf, value, offset, littleEndian) {
                if (value < 0) value = 4294967295 + value + 1;
                for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
                    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255;
                }
            }
            Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset + 3] = value >>> 24;
                    this[offset + 2] = value >>> 16;
                    this[offset + 1] = value >>> 8;
                    this[offset] = value & 255;
                } else {
                    objectWriteUInt32(this, value, offset, true);
                }
                return offset + 4;
            };
            Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 24;
                    this[offset + 1] = value >>> 16;
                    this[offset + 2] = value >>> 8;
                    this[offset + 3] = value & 255;
                } else {
                    objectWriteUInt32(this, value, offset, false);
                }
                return offset + 4;
            };
            Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) {
                    var limit = Math.pow(2, 8 * byteLength - 1);
                    checkInt(this, value, offset, byteLength, limit - 1, -limit);
                }
                var i = 0;
                var mul = 1;
                var sub = value < 0 ? 1 : 0;
                this[offset] = value & 255;
                while (++i < byteLength && (mul *= 256)) {
                    this[offset + i] = (value / mul >> 0) - sub & 255;
                }
                return offset + byteLength;
            };
            Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) {
                    var limit = Math.pow(2, 8 * byteLength - 1);
                    checkInt(this, value, offset, byteLength, limit - 1, -limit);
                }
                var i = byteLength - 1;
                var mul = 1;
                var sub = value < 0 ? 1 : 0;
                this[offset + i] = value & 255;
                while (--i >= 0 && (mul *= 256)) {
                    this[offset + i] = (value / mul >> 0) - sub & 255;
                }
                return offset + byteLength;
            };
            Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
                if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                if (value < 0) value = 255 + value + 1;
                this[offset] = value & 255;
                return offset + 1;
            };
            Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value & 255;
                    this[offset + 1] = value >>> 8;
                } else {
                    objectWriteUInt16(this, value, offset, true);
                }
                return offset + 2;
            };
            Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 8;
                    this[offset + 1] = value & 255;
                } else {
                    objectWriteUInt16(this, value, offset, false);
                }
                return offset + 2;
            };
            Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value & 255;
                    this[offset + 1] = value >>> 8;
                    this[offset + 2] = value >>> 16;
                    this[offset + 3] = value >>> 24;
                } else {
                    objectWriteUInt32(this, value, offset, true);
                }
                return offset + 4;
            };
            Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                if (value < 0) value = 4294967295 + value + 1;
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 24;
                    this[offset + 1] = value >>> 16;
                    this[offset + 2] = value >>> 8;
                    this[offset + 3] = value & 255;
                } else {
                    objectWriteUInt32(this, value, offset, false);
                }
                return offset + 4;
            };
            function checkIEEE754(buf, value, offset, ext, max, min) {
                if (value > max || value < min) throw new RangeError("value is out of bounds");
                if (offset + ext > buf.length) throw new RangeError("index out of range");
                if (offset < 0) throw new RangeError("index out of range");
            }
            function writeFloat(buf, value, offset, littleEndian, noAssert) {
                if (!noAssert) {
                    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
                }
                ieee754.write(buf, value, offset, littleEndian, 23, 4);
                return offset + 4;
            }
            Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
                return writeFloat(this, value, offset, true, noAssert);
            };
            Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
                return writeFloat(this, value, offset, false, noAssert);
            };
            function writeDouble(buf, value, offset, littleEndian, noAssert) {
                if (!noAssert) {
                    checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
                }
                ieee754.write(buf, value, offset, littleEndian, 52, 8);
                return offset + 8;
            }
            Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
                return writeDouble(this, value, offset, true, noAssert);
            };
            Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
                return writeDouble(this, value, offset, false, noAssert);
            };
            // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
            Buffer.prototype.copy = function copy(target, targetStart, start, end) {
                if (!start) start = 0;
                if (!end && end !== 0) end = this.length;
                if (targetStart >= target.length) targetStart = target.length;
                if (!targetStart) targetStart = 0;
                if (end > 0 && end < start) end = start;
                // Copy 0 bytes; we're done
                if (end === start) return 0;
                if (target.length === 0 || this.length === 0) return 0;
                // Fatal error conditions
                if (targetStart < 0) {
                    throw new RangeError("targetStart out of bounds");
                }
                if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
                if (end < 0) throw new RangeError("sourceEnd out of bounds");
                // Are we oob?
                if (end > this.length) end = this.length;
                if (target.length - targetStart < end - start) {
                    end = target.length - targetStart + start;
                }
                var len = end - start;
                var i;
                if (this === target && start < targetStart && targetStart < end) {
                    // descending copy from end
                    for (i = len - 1; i >= 0; i--) {
                        target[i + targetStart] = this[i + start];
                    }
                } else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
                    // ascending copy from start
                    for (i = 0; i < len; i++) {
                        target[i + targetStart] = this[i + start];
                    }
                } else {
                    target._set(this.subarray(start, start + len), targetStart);
                }
                return len;
            };
            // fill(value, start=0, end=buffer.length)
            Buffer.prototype.fill = function fill(value, start, end) {
                if (!value) value = 0;
                if (!start) start = 0;
                if (!end) end = this.length;
                if (end < start) throw new RangeError("end < start");
                // Fill 0 bytes; we're done
                if (end === start) return;
                if (this.length === 0) return;
                if (start < 0 || start >= this.length) throw new RangeError("start out of bounds");
                if (end < 0 || end > this.length) throw new RangeError("end out of bounds");
                var i;
                if (typeof value === "number") {
                    for (i = start; i < end; i++) {
                        this[i] = value;
                    }
                } else {
                    var bytes = utf8ToBytes(value.toString());
                    var len = bytes.length;
                    for (i = start; i < end; i++) {
                        this[i] = bytes[i % len];
                    }
                }
                return this;
            };
            /**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
            Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
                if (typeof Uint8Array !== "undefined") {
                    if (Buffer.TYPED_ARRAY_SUPPORT) {
                        return new Buffer(this).buffer;
                    } else {
                        var buf = new Uint8Array(this.length);
                        for (var i = 0, len = buf.length; i < len; i += 1) {
                            buf[i] = this[i];
                        }
                        return buf.buffer;
                    }
                } else {
                    throw new TypeError("Buffer.toArrayBuffer not supported in this browser");
                }
            };
            // HELPER FUNCTIONS
            // ================
            var BP = Buffer.prototype;
            /**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
            Buffer._augment = function _augment(arr) {
                arr.constructor = Buffer;
                arr._isBuffer = true;
                // save reference to original Uint8Array set method before overwriting
                arr._set = arr.set;
                // deprecated
                arr.get = BP.get;
                arr.set = BP.set;
                arr.write = BP.write;
                arr.toString = BP.toString;
                arr.toLocaleString = BP.toString;
                arr.toJSON = BP.toJSON;
                arr.equals = BP.equals;
                arr.compare = BP.compare;
                arr.indexOf = BP.indexOf;
                arr.copy = BP.copy;
                arr.slice = BP.slice;
                arr.readUIntLE = BP.readUIntLE;
                arr.readUIntBE = BP.readUIntBE;
                arr.readUInt8 = BP.readUInt8;
                arr.readUInt16LE = BP.readUInt16LE;
                arr.readUInt16BE = BP.readUInt16BE;
                arr.readUInt32LE = BP.readUInt32LE;
                arr.readUInt32BE = BP.readUInt32BE;
                arr.readIntLE = BP.readIntLE;
                arr.readIntBE = BP.readIntBE;
                arr.readInt8 = BP.readInt8;
                arr.readInt16LE = BP.readInt16LE;
                arr.readInt16BE = BP.readInt16BE;
                arr.readInt32LE = BP.readInt32LE;
                arr.readInt32BE = BP.readInt32BE;
                arr.readFloatLE = BP.readFloatLE;
                arr.readFloatBE = BP.readFloatBE;
                arr.readDoubleLE = BP.readDoubleLE;
                arr.readDoubleBE = BP.readDoubleBE;
                arr.writeUInt8 = BP.writeUInt8;
                arr.writeUIntLE = BP.writeUIntLE;
                arr.writeUIntBE = BP.writeUIntBE;
                arr.writeUInt16LE = BP.writeUInt16LE;
                arr.writeUInt16BE = BP.writeUInt16BE;
                arr.writeUInt32LE = BP.writeUInt32LE;
                arr.writeUInt32BE = BP.writeUInt32BE;
                arr.writeIntLE = BP.writeIntLE;
                arr.writeIntBE = BP.writeIntBE;
                arr.writeInt8 = BP.writeInt8;
                arr.writeInt16LE = BP.writeInt16LE;
                arr.writeInt16BE = BP.writeInt16BE;
                arr.writeInt32LE = BP.writeInt32LE;
                arr.writeInt32BE = BP.writeInt32BE;
                arr.writeFloatLE = BP.writeFloatLE;
                arr.writeFloatBE = BP.writeFloatBE;
                arr.writeDoubleLE = BP.writeDoubleLE;
                arr.writeDoubleBE = BP.writeDoubleBE;
                arr.fill = BP.fill;
                arr.inspect = BP.inspect;
                arr.toArrayBuffer = BP.toArrayBuffer;
                return arr;
            };
            var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
            function base64clean(str) {
                // Node strips out invalid characters like \n and \t from the string, base64-js does not
                str = stringtrim(str).replace(INVALID_BASE64_RE, "");
                // Node converts strings with length < 2 to ''
                if (str.length < 2) return "";
                // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
                while (str.length % 4 !== 0) {
                    str = str + "=";
                }
                return str;
            }
            function stringtrim(str) {
                if (str.trim) return str.trim();
                return str.replace(/^\s+|\s+$/g, "");
            }
            function toHex(n) {
                if (n < 16) return "0" + n.toString(16);
                return n.toString(16);
            }
            function utf8ToBytes(string, units) {
                units = units || Infinity;
                var codePoint;
                var length = string.length;
                var leadSurrogate = null;
                var bytes = [];
                for (var i = 0; i < length; i++) {
                    codePoint = string.charCodeAt(i);
                    // is surrogate component
                    if (codePoint > 55295 && codePoint < 57344) {
                        // last char was a lead
                        if (!leadSurrogate) {
                            // no lead yet
                            if (codePoint > 56319) {
                                // unexpected trail
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                continue;
                            } else if (i + 1 === length) {
                                // unpaired lead
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                continue;
                            }
                            // valid lead
                            leadSurrogate = codePoint;
                            continue;
                        }
                        // 2 leads in a row
                        if (codePoint < 56320) {
                            if ((units -= 3) > -1) bytes.push(239, 191, 189);
                            leadSurrogate = codePoint;
                            continue;
                        }
                        // valid surrogate pair
                        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
                    } else if (leadSurrogate) {
                        // valid bmp char, but last char was a lead
                        if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    }
                    leadSurrogate = null;
                    // encode utf8
                    if (codePoint < 128) {
                        if ((units -= 1) < 0) break;
                        bytes.push(codePoint);
                    } else if (codePoint < 2048) {
                        if ((units -= 2) < 0) break;
                        bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
                    } else if (codePoint < 65536) {
                        if ((units -= 3) < 0) break;
                        bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
                    } else if (codePoint < 1114112) {
                        if ((units -= 4) < 0) break;
                        bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
                    } else {
                        throw new Error("Invalid code point");
                    }
                }
                return bytes;
            }
            function asciiToBytes(str) {
                var byteArray = [];
                for (var i = 0; i < str.length; i++) {
                    // Node's code seems to be doing this and not & 0x7F..
                    byteArray.push(str.charCodeAt(i) & 255);
                }
                return byteArray;
            }
            function utf16leToBytes(str, units) {
                var c, hi, lo;
                var byteArray = [];
                for (var i = 0; i < str.length; i++) {
                    if ((units -= 2) < 0) break;
                    c = str.charCodeAt(i);
                    hi = c >> 8;
                    lo = c % 256;
                    byteArray.push(lo);
                    byteArray.push(hi);
                }
                return byteArray;
            }
            function base64ToBytes(str) {
                return base64.toByteArray(base64clean(str));
            }
            function blitBuffer(src, dst, offset, length) {
                for (var i = 0; i < length; i++) {
                    if (i + offset >= dst.length || i >= src.length) break;
                    dst[i + offset] = src[i];
                }
                return i;
            }
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "base64-js": 6,
        ieee754: 7,
        isarray: 8
    } ],
    6: [ function(require, module, exports) {
        var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        (function(exports) {
            "use strict";
            var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
            var PLUS = "+".charCodeAt(0);
            var SLASH = "/".charCodeAt(0);
            var NUMBER = "0".charCodeAt(0);
            var LOWER = "a".charCodeAt(0);
            var UPPER = "A".charCodeAt(0);
            var PLUS_URL_SAFE = "-".charCodeAt(0);
            var SLASH_URL_SAFE = "_".charCodeAt(0);
            function decode(elt) {
                var code = elt.charCodeAt(0);
                if (code === PLUS || code === PLUS_URL_SAFE) return 62;
                // '+'
                if (code === SLASH || code === SLASH_URL_SAFE) return 63;
                // '/'
                if (code < NUMBER) return -1;
                //no match
                if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
                if (code < UPPER + 26) return code - UPPER;
                if (code < LOWER + 26) return code - LOWER + 26;
            }
            function b64ToByteArray(b64) {
                var i, j, l, tmp, placeHolders, arr;
                if (b64.length % 4 > 0) {
                    throw new Error("Invalid string. Length must be a multiple of 4");
                }
                // the number of equal signs (place holders)
                // if there are two placeholders, than the two characters before it
                // represent one byte
                // if there is only one, then the three characters before it represent 2 bytes
                // this is just a cheap hack to not do indexOf twice
                var len = b64.length;
                placeHolders = "=" === b64.charAt(len - 2) ? 2 : "=" === b64.charAt(len - 1) ? 1 : 0;
                // base64 is 4/3 + up to two characters of the original data
                arr = new Arr(b64.length * 3 / 4 - placeHolders);
                // if there are placeholders, only get up to the last complete 4 chars
                l = placeHolders > 0 ? b64.length - 4 : b64.length;
                var L = 0;
                function push(v) {
                    arr[L++] = v;
                }
                for (i = 0, j = 0; i < l; i += 4, j += 3) {
                    tmp = decode(b64.charAt(i)) << 18 | decode(b64.charAt(i + 1)) << 12 | decode(b64.charAt(i + 2)) << 6 | decode(b64.charAt(i + 3));
                    push((tmp & 16711680) >> 16);
                    push((tmp & 65280) >> 8);
                    push(tmp & 255);
                }
                if (placeHolders === 2) {
                    tmp = decode(b64.charAt(i)) << 2 | decode(b64.charAt(i + 1)) >> 4;
                    push(tmp & 255);
                } else if (placeHolders === 1) {
                    tmp = decode(b64.charAt(i)) << 10 | decode(b64.charAt(i + 1)) << 4 | decode(b64.charAt(i + 2)) >> 2;
                    push(tmp >> 8 & 255);
                    push(tmp & 255);
                }
                return arr;
            }
            function uint8ToBase64(uint8) {
                var i, extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
                output = "", temp, length;
                function encode(num) {
                    return lookup.charAt(num);
                }
                function tripletToBase64(num) {
                    return encode(num >> 18 & 63) + encode(num >> 12 & 63) + encode(num >> 6 & 63) + encode(num & 63);
                }
                // go through the array every three bytes, we'll deal with trailing stuff later
                for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                    temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                    output += tripletToBase64(temp);
                }
                // pad the end with zeros, but make sure to not forget the extra bytes
                switch (extraBytes) {
                  case 1:
                    temp = uint8[uint8.length - 1];
                    output += encode(temp >> 2);
                    output += encode(temp << 4 & 63);
                    output += "==";
                    break;

                  case 2:
                    temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
                    output += encode(temp >> 10);
                    output += encode(temp >> 4 & 63);
                    output += encode(temp << 2 & 63);
                    output += "=";
                    break;
                }
                return output;
            }
            exports.toByteArray = b64ToByteArray;
            exports.fromByteArray = uint8ToBase64;
        })(typeof exports === "undefined" ? this.base64js = {} : exports);
    }, {} ],
    7: [ function(require, module, exports) {
        exports.read = function(buffer, offset, isLE, mLen, nBytes) {
            var e, m;
            var eLen = nBytes * 8 - mLen - 1;
            var eMax = (1 << eLen) - 1;
            var eBias = eMax >> 1;
            var nBits = -7;
            var i = isLE ? nBytes - 1 : 0;
            var d = isLE ? -1 : 1;
            var s = buffer[offset + i];
            i += d;
            e = s & (1 << -nBits) - 1;
            s >>= -nBits;
            nBits += eLen;
            for (;nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
            m = e & (1 << -nBits) - 1;
            e >>= -nBits;
            nBits += mLen;
            for (;nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
            if (e === 0) {
                e = 1 - eBias;
            } else if (e === eMax) {
                return m ? NaN : (s ? -1 : 1) * Infinity;
            } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias;
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
        };
        exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
            var e, m, c;
            var eLen = nBytes * 8 - mLen - 1;
            var eMax = (1 << eLen) - 1;
            var eBias = eMax >> 1;
            var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
            var i = isLE ? 0 : nBytes - 1;
            var d = isLE ? 1 : -1;
            var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
            value = Math.abs(value);
            if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax;
            } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                    e--;
                    c *= 2;
                }
                if (e + eBias >= 1) {
                    value += rt / c;
                } else {
                    value += rt * Math.pow(2, 1 - eBias);
                }
                if (value * c >= 2) {
                    e++;
                    c /= 2;
                }
                if (e + eBias >= eMax) {
                    m = 0;
                    e = eMax;
                } else if (e + eBias >= 1) {
                    m = (value * c - 1) * Math.pow(2, mLen);
                    e = e + eBias;
                } else {
                    m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                    e = 0;
                }
            }
            for (;mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {}
            e = e << mLen | m;
            eLen += mLen;
            for (;eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {}
            buffer[offset + i - d] |= s * 128;
        };
    }, {} ],
    8: [ function(require, module, exports) {
        module.exports = Array.isArray || function(arr) {
            return Object.prototype.toString.call(arr) == "[object Array]";
        };
    }, {} ],
    9: [ function(require, module, exports) {
        (function(Buffer) {
            /* crc32.js (C) 2014 SheetJS -- http://sheetjs.com */
            /* vim: set ts=2: */
            var CRC32 = {};
            (function(CRC32) {
                CRC32.version = "0.2.2";
                /* see perf/crc32table.js */
                function signed_crc_table() {
                    var c, table = new Array(256);
                    for (var n = 0; n != 256; ++n) {
                        c = n;
                        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
                        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
                        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
                        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
                        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
                        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
                        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
                        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
                        table[n] = c;
                    }
                    return typeof Int32Array !== "undefined" ? new Int32Array(table) : table;
                }
                var table = signed_crc_table();
                /* charCodeAt is the best approach for binary strings */
                var use_buffer = typeof Buffer !== "undefined";
                function crc32_bstr(bstr) {
                    if (bstr.length > 32768) if (use_buffer) return crc32_buf_8(Buffer(bstr));
                    var crc = -1, L = bstr.length - 1;
                    for (var i = 0; i < L; ) {
                        crc = table[(crc ^ bstr.charCodeAt(i++)) & 255] ^ crc >>> 8;
                        crc = table[(crc ^ bstr.charCodeAt(i++)) & 255] ^ crc >>> 8;
                    }
                    if (i === L) crc = crc >>> 8 ^ table[(crc ^ bstr.charCodeAt(i)) & 255];
                    return crc ^ -1;
                }
                function crc32_buf(buf) {
                    if (buf.length > 1e4) return crc32_buf_8(buf);
                    for (var crc = -1, i = 0, L = buf.length - 3; i < L; ) {
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                    }
                    while (i < L + 3) crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                    return crc ^ -1;
                }
                function crc32_buf_8(buf) {
                    for (var crc = -1, i = 0, L = buf.length - 7; i < L; ) {
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                        crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                    }
                    while (i < L + 7) crc = crc >>> 8 ^ table[(crc ^ buf[i++]) & 255];
                    return crc ^ -1;
                }
                /* much much faster to intertwine utf8 and crc */
                function crc32_str(str) {
                    for (var crc = -1, i = 0, L = str.length, c, d; i < L; ) {
                        c = str.charCodeAt(i++);
                        if (c < 128) {
                            crc = crc >>> 8 ^ table[(crc ^ c) & 255];
                        } else if (c < 2048) {
                            crc = crc >>> 8 ^ table[(crc ^ (192 | c >> 6 & 31)) & 255];
                            crc = crc >>> 8 ^ table[(crc ^ (128 | c & 63)) & 255];
                        } else if (c >= 55296 && c < 57344) {
                            c = (c & 1023) + 64;
                            d = str.charCodeAt(i++) & 1023;
                            crc = crc >>> 8 ^ table[(crc ^ (240 | c >> 8 & 7)) & 255];
                            crc = crc >>> 8 ^ table[(crc ^ (128 | c >> 2 & 63)) & 255];
                            crc = crc >>> 8 ^ table[(crc ^ (128 | d >> 6 & 15 | c & 3)) & 255];
                            crc = crc >>> 8 ^ table[(crc ^ (128 | d & 63)) & 255];
                        } else {
                            crc = crc >>> 8 ^ table[(crc ^ (224 | c >> 12 & 15)) & 255];
                            crc = crc >>> 8 ^ table[(crc ^ (128 | c >> 6 & 63)) & 255];
                            crc = crc >>> 8 ^ table[(crc ^ (128 | c & 63)) & 255];
                        }
                    }
                    return crc ^ -1;
                }
                CRC32.table = table;
                CRC32.bstr = crc32_bstr;
                CRC32.buf = crc32_buf;
                CRC32.str = crc32_str;
            })(typeof exports !== "undefined" && typeof DO_NOT_EXPORT_CRC === "undefined" ? exports : CRC32);
        }).call(this, require("buffer").Buffer);
    }, {
        buffer: 5
    } ],
    10: [ function(require, module, exports) {
        (function() {
            var crypt = require("crypt"), utf8 = require("charenc").utf8, isBuffer = require("is-buffer"), bin = require("charenc").bin, // The core
            md5 = function(message, options) {
                // Convert to byte array
                if (message.constructor == String) if (options && options.encoding === "binary") message = bin.stringToBytes(message); else message = utf8.stringToBytes(message); else if (isBuffer(message)) message = Array.prototype.slice.call(message, 0); else if (!Array.isArray(message)) message = message.toString();
                // else, assume byte array already
                var m = crypt.bytesToWords(message), l = message.length * 8, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
                // Swap endian
                for (var i = 0; i < m.length; i++) {
                    m[i] = (m[i] << 8 | m[i] >>> 24) & 16711935 | (m[i] << 24 | m[i] >>> 8) & 4278255360;
                }
                // Padding
                m[l >>> 5] |= 128 << l % 32;
                m[(l + 64 >>> 9 << 4) + 14] = l;
                // Method shortcuts
                var FF = md5._ff, GG = md5._gg, HH = md5._hh, II = md5._ii;
                for (var i = 0; i < m.length; i += 16) {
                    var aa = a, bb = b, cc = c, dd = d;
                    a = FF(a, b, c, d, m[i + 0], 7, -680876936);
                    d = FF(d, a, b, c, m[i + 1], 12, -389564586);
                    c = FF(c, d, a, b, m[i + 2], 17, 606105819);
                    b = FF(b, c, d, a, m[i + 3], 22, -1044525330);
                    a = FF(a, b, c, d, m[i + 4], 7, -176418897);
                    d = FF(d, a, b, c, m[i + 5], 12, 1200080426);
                    c = FF(c, d, a, b, m[i + 6], 17, -1473231341);
                    b = FF(b, c, d, a, m[i + 7], 22, -45705983);
                    a = FF(a, b, c, d, m[i + 8], 7, 1770035416);
                    d = FF(d, a, b, c, m[i + 9], 12, -1958414417);
                    c = FF(c, d, a, b, m[i + 10], 17, -42063);
                    b = FF(b, c, d, a, m[i + 11], 22, -1990404162);
                    a = FF(a, b, c, d, m[i + 12], 7, 1804603682);
                    d = FF(d, a, b, c, m[i + 13], 12, -40341101);
                    c = FF(c, d, a, b, m[i + 14], 17, -1502002290);
                    b = FF(b, c, d, a, m[i + 15], 22, 1236535329);
                    a = GG(a, b, c, d, m[i + 1], 5, -165796510);
                    d = GG(d, a, b, c, m[i + 6], 9, -1069501632);
                    c = GG(c, d, a, b, m[i + 11], 14, 643717713);
                    b = GG(b, c, d, a, m[i + 0], 20, -373897302);
                    a = GG(a, b, c, d, m[i + 5], 5, -701558691);
                    d = GG(d, a, b, c, m[i + 10], 9, 38016083);
                    c = GG(c, d, a, b, m[i + 15], 14, -660478335);
                    b = GG(b, c, d, a, m[i + 4], 20, -405537848);
                    a = GG(a, b, c, d, m[i + 9], 5, 568446438);
                    d = GG(d, a, b, c, m[i + 14], 9, -1019803690);
                    c = GG(c, d, a, b, m[i + 3], 14, -187363961);
                    b = GG(b, c, d, a, m[i + 8], 20, 1163531501);
                    a = GG(a, b, c, d, m[i + 13], 5, -1444681467);
                    d = GG(d, a, b, c, m[i + 2], 9, -51403784);
                    c = GG(c, d, a, b, m[i + 7], 14, 1735328473);
                    b = GG(b, c, d, a, m[i + 12], 20, -1926607734);
                    a = HH(a, b, c, d, m[i + 5], 4, -378558);
                    d = HH(d, a, b, c, m[i + 8], 11, -2022574463);
                    c = HH(c, d, a, b, m[i + 11], 16, 1839030562);
                    b = HH(b, c, d, a, m[i + 14], 23, -35309556);
                    a = HH(a, b, c, d, m[i + 1], 4, -1530992060);
                    d = HH(d, a, b, c, m[i + 4], 11, 1272893353);
                    c = HH(c, d, a, b, m[i + 7], 16, -155497632);
                    b = HH(b, c, d, a, m[i + 10], 23, -1094730640);
                    a = HH(a, b, c, d, m[i + 13], 4, 681279174);
                    d = HH(d, a, b, c, m[i + 0], 11, -358537222);
                    c = HH(c, d, a, b, m[i + 3], 16, -722521979);
                    b = HH(b, c, d, a, m[i + 6], 23, 76029189);
                    a = HH(a, b, c, d, m[i + 9], 4, -640364487);
                    d = HH(d, a, b, c, m[i + 12], 11, -421815835);
                    c = HH(c, d, a, b, m[i + 15], 16, 530742520);
                    b = HH(b, c, d, a, m[i + 2], 23, -995338651);
                    a = II(a, b, c, d, m[i + 0], 6, -198630844);
                    d = II(d, a, b, c, m[i + 7], 10, 1126891415);
                    c = II(c, d, a, b, m[i + 14], 15, -1416354905);
                    b = II(b, c, d, a, m[i + 5], 21, -57434055);
                    a = II(a, b, c, d, m[i + 12], 6, 1700485571);
                    d = II(d, a, b, c, m[i + 3], 10, -1894986606);
                    c = II(c, d, a, b, m[i + 10], 15, -1051523);
                    b = II(b, c, d, a, m[i + 1], 21, -2054922799);
                    a = II(a, b, c, d, m[i + 8], 6, 1873313359);
                    d = II(d, a, b, c, m[i + 15], 10, -30611744);
                    c = II(c, d, a, b, m[i + 6], 15, -1560198380);
                    b = II(b, c, d, a, m[i + 13], 21, 1309151649);
                    a = II(a, b, c, d, m[i + 4], 6, -145523070);
                    d = II(d, a, b, c, m[i + 11], 10, -1120210379);
                    c = II(c, d, a, b, m[i + 2], 15, 718787259);
                    b = II(b, c, d, a, m[i + 9], 21, -343485551);
                    a = a + aa >>> 0;
                    b = b + bb >>> 0;
                    c = c + cc >>> 0;
                    d = d + dd >>> 0;
                }
                return crypt.endian([ a, b, c, d ]);
            };
            // Auxiliary functions
            md5._ff = function(a, b, c, d, x, s, t) {
                var n = a + (b & c | ~b & d) + (x >>> 0) + t;
                return (n << s | n >>> 32 - s) + b;
            };
            md5._gg = function(a, b, c, d, x, s, t) {
                var n = a + (b & d | c & ~d) + (x >>> 0) + t;
                return (n << s | n >>> 32 - s) + b;
            };
            md5._hh = function(a, b, c, d, x, s, t) {
                var n = a + (b ^ c ^ d) + (x >>> 0) + t;
                return (n << s | n >>> 32 - s) + b;
            };
            md5._ii = function(a, b, c, d, x, s, t) {
                var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
                return (n << s | n >>> 32 - s) + b;
            };
            // Package private blocksize
            md5._blocksize = 16;
            md5._digestsize = 16;
            module.exports = function(message, options) {
                if (typeof message == "undefined") return;
                var digestbytes = crypt.wordsToBytes(md5(message, options));
                return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt.bytesToHex(digestbytes);
            };
        })();
    }, {
        charenc: 11,
        crypt: 12,
        "is-buffer": 13
    } ],
    11: [ function(require, module, exports) {
        var charenc = {
            // UTF-8 encoding
            utf8: {
                // Convert a string to a byte array
                stringToBytes: function(str) {
                    return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
                },
                // Convert a byte array to a string
                bytesToString: function(bytes) {
                    return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
                }
            },
            // Binary encoding
            bin: {
                // Convert a string to a byte array
                stringToBytes: function(str) {
                    for (var bytes = [], i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i) & 255);
                    return bytes;
                },
                // Convert a byte array to a string
                bytesToString: function(bytes) {
                    for (var str = [], i = 0; i < bytes.length; i++) str.push(String.fromCharCode(bytes[i]));
                    return str.join("");
                }
            }
        };
        module.exports = charenc;
    }, {} ],
    12: [ function(require, module, exports) {
        (function() {
            var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", crypt = {
                // Bit-wise rotation left
                rotl: function(n, b) {
                    return n << b | n >>> 32 - b;
                },
                // Bit-wise rotation right
                rotr: function(n, b) {
                    return n << 32 - b | n >>> b;
                },
                // Swap big-endian to little-endian and vice versa
                endian: function(n) {
                    // If number given, swap endian
                    if (n.constructor == Number) {
                        return crypt.rotl(n, 8) & 16711935 | crypt.rotl(n, 24) & 4278255360;
                    }
                    // Else, assume array and swap all items
                    for (var i = 0; i < n.length; i++) n[i] = crypt.endian(n[i]);
                    return n;
                },
                // Generate an array of any length of random bytes
                randomBytes: function(n) {
                    for (var bytes = []; n > 0; n--) bytes.push(Math.floor(Math.random() * 256));
                    return bytes;
                },
                // Convert a byte array to big-endian 32-bit words
                bytesToWords: function(bytes) {
                    for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8) words[b >>> 5] |= bytes[i] << 24 - b % 32;
                    return words;
                },
                // Convert big-endian 32-bit words to a byte array
                wordsToBytes: function(words) {
                    for (var bytes = [], b = 0; b < words.length * 32; b += 8) bytes.push(words[b >>> 5] >>> 24 - b % 32 & 255);
                    return bytes;
                },
                // Convert a byte array to a hex string
                bytesToHex: function(bytes) {
                    for (var hex = [], i = 0; i < bytes.length; i++) {
                        hex.push((bytes[i] >>> 4).toString(16));
                        hex.push((bytes[i] & 15).toString(16));
                    }
                    return hex.join("");
                },
                // Convert a hex string to a byte array
                hexToBytes: function(hex) {
                    for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
                    return bytes;
                },
                // Convert a byte array to a base-64 string
                bytesToBase64: function(bytes) {
                    for (var base64 = [], i = 0; i < bytes.length; i += 3) {
                        var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
                        for (var j = 0; j < 4; j++) if (i * 8 + j * 6 <= bytes.length * 8) base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 63)); else base64.push("=");
                    }
                    return base64.join("");
                },
                // Convert a base-64 string to a byte array
                base64ToBytes: function(base64) {
                    // Remove non-base-64 characters
                    base64 = base64.replace(/[^A-Z0-9+\/]/gi, "");
                    for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
                        if (imod4 == 0) continue;
                        bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i)) >>> 6 - imod4 * 2);
                    }
                    return bytes;
                }
            };
            module.exports = crypt;
        })();
    }, {} ],
    13: [ function(require, module, exports) {
        /**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */
        module.exports = function(obj) {
            return !!(obj != null && obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj));
        };
    }, {} ],
    14: [ function(require, module, exports) {
        arguments[4][11][0].apply(exports, arguments);
    }, {
        dup: 11
    } ],
    15: [ function(require, module, exports) {
        arguments[4][12][0].apply(exports, arguments);
    }, {
        dup: 12
    } ],
    16: [ function(require, module, exports) {
        (function(Buffer) {
            (function() {
                var crypt = require("crypt"), utf8 = require("charenc").utf8, bin = require("charenc").bin, // The core
                sha1 = function(message) {
                    // Convert to byte array
                    if (message.constructor == String) message = utf8.stringToBytes(message); else if (typeof Buffer !== "undefined" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(message)) message = Array.prototype.slice.call(message, 0); else if (!Array.isArray(message)) message = message.toString();
                    // otherwise assume byte array
                    var m = crypt.bytesToWords(message), l = message.length * 8, w = [], H0 = 1732584193, H1 = -271733879, H2 = -1732584194, H3 = 271733878, H4 = -1009589776;
                    // Padding
                    m[l >> 5] |= 128 << 24 - l % 32;
                    m[(l + 64 >>> 9 << 4) + 15] = l;
                    for (var i = 0; i < m.length; i += 16) {
                        var a = H0, b = H1, c = H2, d = H3, e = H4;
                        for (var j = 0; j < 80; j++) {
                            if (j < 16) w[j] = m[i + j]; else {
                                var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
                                w[j] = n << 1 | n >>> 31;
                            }
                            var t = (H0 << 5 | H0 >>> 27) + H4 + (w[j] >>> 0) + (j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 : j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 : j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 : (H1 ^ H2 ^ H3) - 899497514);
                            H4 = H3;
                            H3 = H2;
                            H2 = H1 << 30 | H1 >>> 2;
                            H1 = H0;
                            H0 = t;
                        }
                        H0 += a;
                        H1 += b;
                        H2 += c;
                        H3 += d;
                        H4 += e;
                    }
                    return [ H0, H1, H2, H3, H4 ];
                }, // Public API
                api = function(message, options) {
                    var digestbytes = crypt.wordsToBytes(sha1(message));
                    return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt.bytesToHex(digestbytes);
                };
                api._blocksize = 16;
                api._digestsize = 20;
                module.exports = api;
            })();
        }).call(this, require("buffer").Buffer);
    }, {
        buffer: 5,
        charenc: 14,
        crypt: 15
    } ]
}, {}, [ 1 ]);
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([ "exports", "i18next" ], function(exports, i18n) {
            root.i18nText = root.i18nText || {};
            return factory(exports = root.i18nText, i18n);
        });
    } else if (typeof exports !== "undefined") {
        // CommonJS
        exports.hash = require("../lib/hash");
        factory(exports, require("i18next"));
    } else {
        root.i18nText = root.i18nText || {};
        factory(root.i18nText, root.i18n);
    }
})(this, function(exports, i18n) {
    i18n = i18n || {};
    exports.hash = exports.hash || {};
    var echo = function(str) {
        return str;
    };
    var defaultHash = "sha1";
    var options = {
        debug: false,
        hash: exports.hash[defaultHash] || echo
    };
    var error = function(str) {
        if (typeof console !== "undefined" && typeof console.error === "function") {
            console.error("i18next-text:", str);
        }
    };
    var log = function(str) {
        if (options.debug && typeof console !== "undefined" && typeof console.log === "function") {
            console.log("i18next-text:", str);
        }
    };
    exports.init = function(opts) {
        opts = opts || {};
        options.hash = typeof opts.hash === "function" && opts.hash || typeof opts.hash === "string" && exports.hash[opts.hash] || echo;
        options.debug = !!opts.debug;
    };
    exports.key = function(str) {
        return options.hash(str);
    };
    exports.exists = function(str, opts) {
        var key;
        if (typeof str !== "string") {
            return false;
        }
        opts = opts || {};
        key = opts.defaultKey;
        if (typeof key === "undefined") {
            key = options.hash(str);
            log("hash(" + JSON.stringify(str) + ")=" + JSON.stringify(key));
        }
        if (typeof i18n.exists !== "function") {
            error("i18next library is not loaded");
            return false;
        }
        return i18n.exists(key, opts);
    };
    exports._ = exports.text = function(str, opts) {
        var key, t;
        if (typeof str !== "string") {
            return;
        }
        opts = opts || {};
        opts.defaultValue = opts.defaultValue || str;
        key = opts.defaultKey;
        if (typeof key === "undefined") {
            key = options.hash(str);
            log("hash(" + JSON.stringify(str) + ")=" + JSON.stringify(key));
        }
        t = i18n.t || i18n.translate;
        if (typeof t !== "function") {
            error("i18next library is not loaded");
            return;
        }
        return t(key, opts);
    };
    exports.handlebarsHelper = function(context, options) {
        var defaultValue;
        if (typeof context === "object" && typeof options === "undefined") {
            // {{i18n defaultKey='loading'}}
            options = context;
            context = undefined;
        }
        if (typeof options === "object" && typeof options.fn === "function") {
            // {{#i18n}}<span>Some text</span>{{/i18n}}
            // {{#i18n this}}<p>Description: {{description}}</p>{{/i18n}}
            defaultValue = options.fn(context);
        } else if (typeof context === "string") {
            // {{i18n 'Basic Example'}}
            // {{i18n '__first-name__ __last-name__' first-name=firstname last-name=lastname}}
            // {{i18n 'English' defaultKey='locale:language.en-US'}}
            defaultValue = context;
        }
        options = options || {};
        options.hash = options.hash || {};
        var opts = i18n.functions.extend({
            defaultValue: defaultValue
        }, options.hash);
        var defaultKey = options.hash.defaultKey;
        var result;
        if (typeof defaultKey === "undefined") {
            result = i18n._(defaultValue, opts);
        } else {
            result = i18n.t(defaultKey, opts);
        }
        return result;
    };
    return exports;
});