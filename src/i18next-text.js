(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'i18next'], function(exports, i18n) {
            root.i18nText = (root.i18nText || {});
            factory((exports = root.i18nText), i18n);
        });
    } else if (typeof exports !== 'undefined') {
        // CommonJS
        exports.hash = require('../lib/hash');
        factory(exports, require('i18next'));
    } else {
        root.i18nText = (root.i18nText || {});
        factory(root.i18nText, root.i18n);
    }

}(this, function(exports, i18n) {
    i18n = i18n || {};
    exports.hash = exports.hash || {};

    var echo = function(str) {
        return str;
    };
    var error = function(str) {
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
            console.error('i18next-text:', str);
        }
    };
    var log = function(str) {
        if (options.debug && typeof console !== 'undefined' && typeof console.log === 'function') {
            console.log('i18next-text:', str);
        }
    };
    var defaultHash = 'sha1';
    var options = {
        debug: false,
        hash: exports.hash[defaultHash] || echo
    };

    exports.init = function(opts) {
        opts = opts || {};
        options.hash = (typeof opts.hash === 'function' && opts.hash) ||
                       (typeof opts.hash === 'string' && exports.hash[opts.hash]) ||
                       echo;
        options.debug = !!opts.debug;
    };

    exports.key = function(str) {
        return options.hash(str);
    };

    exports._ = exports.text = function(str, opts) {
        if (typeof str !== 'string') {
            return;
        }

        var key = options.hash(str);
        var translate = i18n.t || i18n.translate;
        opts = opts || {};
        opts.defaultValue = str;

        log('hash(' + JSON.stringify(str) + ')=' + JSON.stringify(key));

        if (typeof translate !== 'function') {
            error('i18next library is not loaded');
            return;
        }

        return translate(key, opts);
    };

    return exports;
}));
