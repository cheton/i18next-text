'use strict';

var fs = require('fs');
var path = require('path');
var test = require('tap').test;
var handlebars = require('handlebars');
var i18n = require('i18next');
var i18nText = require('../');
i18n._ = i18nText._;

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

test('setup', function(t) {
    t.assert(typeof i18nText.handlebarsHelper === 'function');
    handlebars.registerHelper('i18n', function() {
        var result = i18nText.handlebarsHelper.apply(this, arguments);
        return new handlebars.SafeString(result);
    });

    i18n.init(i18nextOptions, function() {
        t.end();
    });
});

test('teardown', function(t) {
    t.end();
});

test('i18next initialization', function(t) {
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

test('hash function', function(t) {
    var runHashTest = function(t, hashMethod) {
        var hash = require('../lib/hash');
        var str = 'Loading...';
        var expectedKey = hash[hashMethod](str);

        i18nText.init({hash: hashMethod});

        // Test for existence of a key
        t.ok(i18n.exists(expectedKey), 'This key should exist.');

        // English
        i18n.setLng('en');
        t.equal('Loading...', i18n._(str), 'English translation should be \'Loading...\'');
        t.equal(expectedKey, i18nText.key(str));

        // German
        i18n.setLng('de');
        t.equal('Wird geladen...', i18n._(str), 'German translation should be \'Wird geladen...\'');
        t.equal(expectedKey, i18nText.key(str));

        // French
        i18n.setLng('fr');
        t.equal('Chargement...', i18n._(str), 'French translation should be \'Chargement...\'');
        t.equal(expectedKey, i18nText.key(str));

        // Spanish
        i18n.setLng('es');
        t.equal('Cargando...', i18n._(str), 'Spanish translation should be \'Cargando...\'');
        t.equal(expectedKey, i18nText.key(str));

        // Italian
        i18n.setLng('it');
        t.equal('Caricamento in corso...', i18n._(str), 'Italian translation should be \'Caricamento in corso...\'');
        t.equal(expectedKey, i18nText.key(str));

        // Japanese
        i18n.setLng('ja');
        t.equal('ロード中...', i18n._(str), 'Japanese translation should be \'ロード中...\'');
        t.equal(expectedKey, i18nText.key(str));

        // Not exists
        str = 'This value does not exist.';
        expectedKey = hash[hashMethod](str);
        t.notOk(i18n.exists(expectedKey));
        t.notOk(i18nText.exists(str));
        t.assert(expectedKey === i18nText.key(str));
        t.equal(str, i18n._(str));

        t.end();
    };

    t.test('crc32', function(t) {
        runHashTest(t, 'crc32');
    });

    t.test('sha1', function(t) {
        runHashTest(t, 'sha1');
    });

    t.test('md5', function(t) {
        runHashTest(t, 'md5');
    });
});

test('handlebars-helper-i18n', function(t) {
    var source = fs.readFileSync(toFixturePath('handlebars-helper-i18n.hbs'), 'utf-8');
    var template = handlebars.compile(source);
    var context = {
        'firstname':'Foo',
        'lastname':'Bar',
        'description': 'Foo Bar Test'
    };
    var expectedOutput = [
        'Basic Example',
        'Foo Bar',
        'English',
        'Loading...',
        'Some text',
        'Description: Foo Bar Test',
        'Foo Bar',
        ''
    ].join('\n');

    i18n.setLng('en');
    t.equal(template(context), expectedOutput);

    t.end();
});
