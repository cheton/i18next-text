/**
 * i18next-text - Using i18next translations without having the `key` as strings, you do not need to worry about i18n key naming.
 * Cheton Wu <cheton@gmail.com>
 * Version 0.4.0
 * MIT Licensed
 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([ "exports", "i18next" ], function(exports, i18n) {
            root.i18nText = root.i18nText || {};
            factory(exports = root.i18nText, i18n);
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
    var defaultHash = "sha1";
    var options = {
        debug: false,
        hash: exports.hash[defaultHash] || echo
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
    return exports;
});