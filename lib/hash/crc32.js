var crc32 = require('crc-32');
var pad = function(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

module.exports = function(str) {
    var checksum = crc32.str(str);
    // convert to 2's complement hex
    var str = (checksum >>> 0).toString(16);
    return pad(str, 8);
};
