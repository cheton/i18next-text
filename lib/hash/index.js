(function(root, factory) {
    if (typeof exports !== 'undefined') {
        // CommonJS
        factory(exports);
    } else {
        root.i18nText = root.i18nText || {};
        root.i18nText.hash = root.i18nText.hash || {};
        factory(root.i18nText.hash);

    }
}(this, function(exports) {
    exports.sha1 = require('./sha1');

    return exports;
}));
