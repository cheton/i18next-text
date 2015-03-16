'use strict';

var path = require('path');
var test = require('tap').test;
var i18n = require('i18next');
var text = require('../');
i18n._ = text._;

var toFixturePath = function(fileName) {
    var args = Array.prototype.slice.call(arguments);
    return path.resolve.apply(null, [__dirname, 'fixtures'].concat(args));
};

var i18nextOptions = {
    lng: 'en',
    debug: true,
    // Preload additional languages on init:
    preload: ['en', 'de', 'es', 'fr', 'it', 'ja'],
    load: 'current', // all, current, unspecific
    fallbackLng: false,
    resGetPath: toFixturePath('i18n', '__lng__', '__ns__.json'),
    // Multiple namespace
    ns: {
        namespaces: [
            'resource' // default
        ],
        defaultNs: 'resource'
    }
};

test('i18next initialization', function(t) {
    i18n.init(i18nextOptions, function() {
        // English
        i18n.setLng('en');
        t.equal('Loading...', i18n.t('loading'));

        // German
        i18n.setLng('de');
        t.equal('Wird geladen...', i18n.t('loading'));

        // French
        i18n.setLng('fr');
        t.equal('Chargement...', i18n.t('loading'));

        // Spanish
        i18n.setLng('es');
        t.equal('Cargando...', i18n.t('loading'));

        // Italian
        i18n.setLng('it');
        t.equal('Caricamento in corso...', i18n.t('loading'));

        // Japanese
        i18n.setLng('ja');
        t.equal('ロード中...', i18n.t('loading'));

        t.end();
    });
});

test('sha1', function(t) {
    i18n.init(i18nextOptions, function() {
        var str = 'Loading...';
        var expectedKey = 'b04ba49f848624bb97ab094a2631d2ad74913498';

        var sha1 = require('../lib/hash/sha1');
        t.equal(expectedKey, sha1(str), 'The value of sha1(' + JSON.stringify(str) + ') should be equal to ' + expectedKey);

        text.init({hash: 'sha1'});

        // Test for existence of a key
        t.ok(i18n.exists(expectedKey), 'This key should exist.');

        // English
        i18n.setLng('en');
        t.equal('Loading...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // German
        i18n.setLng('de');
        t.equal('Wird geladen...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // French
        i18n.setLng('fr');
        t.equal('Chargement...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // Spanish
        i18n.setLng('es');
        t.equal('Cargando...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // Italian
        i18n.setLng('it');
        t.equal('Caricamento in corso...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // Japanese
        i18n.setLng('ja');
        t.equal('ロード中...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // Not exists
        str = 'This value does not exist.';
        expectedKey = sha1(str);
        t.notOk(i18n.exists(expectedKey));
        t.notOk(text.exists(str));
        t.assert(expectedKey === text.key(str));
        t.equal(str, i18n._(str));

        t.end();
    });
});

test('crc32', function(t) {
    i18n.init(i18nextOptions, function() {
        var str = 'Loading...';
        var expectedKey = 'cd643ef3';

        var crc32 = require('../lib/hash/crc32');
        t.equal(expectedKey, crc32(str), 'The value of crc32(' + JSON.stringify(str) + ') should be equal to ' + expectedKey);

        text.init({hash: 'crc32'});

        // Test for existence of a key
        t.ok(i18n.exists(expectedKey), 'This key should exist.');

        // English
        i18n.setLng('en');
        t.equal('Loading...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // German
        i18n.setLng('de');
        t.equal('Wird geladen...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // French
        i18n.setLng('fr');
        t.equal('Chargement...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // Spanish
        i18n.setLng('es');
        t.equal('Cargando...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // Italian
        i18n.setLng('it');
        t.equal('Caricamento in corso...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // Japanese
        i18n.setLng('ja');
        t.equal('ロード中...', i18n._(str));
        t.equal(expectedKey, text.key(str));

        // Not exists
        str = 'This value does not exist.';
        expectedKey = crc32(str);
        t.notOk(i18n.exists(expectedKey));
        t.notOk(text.exists(str));
        t.assert(expectedKey === text.key(str));
        t.equal(str, i18n._(str));

        t.end();
    });
});
