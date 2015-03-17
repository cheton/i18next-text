(function(root, factory) {
    if (root === window) {
        root.i18nText = root.i18nText || {};
        root.i18nText.hash = root.i18nText.hash || {};
        factory(exports = root.i18nText.hash);
    } else {
        factory(exports);
    }
}(window || this, function(exports) {
    exports.crc32 = require('./crc32');
    exports.md5 = require('./md5');
    exports.sha1 = require('./sha1');

    return exports;
}));
