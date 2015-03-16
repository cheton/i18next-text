# i18next-text [![build status](https://travis-ci.org/cheton/i18next-text.svg?branch=master)](https://travis-ci.org/cheton/i18next-text)

[![NPM](https://nodei.co/npm/i18next-text.png?downloads=true&stars=true)](https://nodei.co/npm/i18next-text/)

Using [i18next](http://i18next.com/) translations without having the `key` as strings, you do not need to worry about i18n key naming.

It's recommended to use [i18next-scanner](https://github.com/cheton/i18next-scanner) as a Grunt/Gulp task to scan your code, extract and merge translation keys and strings into i18n resource files.

Save your time and work more efficiently!

## Features
* Supports most [i18next features](http://i18next.com/pages/doc_features.html).
* Automatically generates a hash for an i18n text string as its unique key. It is not necessary to manually maintain resource files.
* Supports CRC32, MD5, and SHA-1 hash (The default is SHA-1).
* You can customize your own hash function by including the [i18next-text.custom.js](https://raw.githubusercontent.com/cheton/i18next-text/master/dist/i18next-text.custom.js) file with only 2KB in size.

## Installation

With [bower](http://bower.io/):
```
bower install i18next-text
```

With [npm](https://npmjs.org/):
```
npm install i18next-text
```

## Initialization
Normally [i18next-text](https://github.com/cheton/i18next-text/) can be initialized with options by calling i18nText.init():
```javascript`
// You can omit this step if using default options
i18nText.init({
    debug: true, // default: false
    hash: 'sha1' // default: 'sha1'
});
```

Then extends i18n object to provide a new _() method:
```javascript
i18n._ = i18nText._;
```

Initializes i18next with options:
```javascript
i18n.init({lng: 'en'});

// later
i18n.t('key');
i18n._('It is no longer needed by specifying the key.');
```

or initializes i18next with both options and callback:
```javascript
i18n.init({lng: 'en'}, function(t) {
    i18n.t('key');
    i18n._('It is no longer needed by specifying the key.');
});
```

## Usage

For example, assume that you have the following directory structure:
```
index.html
vendor/
    i18next.js
    i18next-text.js
i18n/
    en/
        resource.json
    de/
        resource.json
```

index.html
```html
<!doctype html>
<html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
    </head>
    <body>
        <script src="vendor/i18next.js"></script>
        <script src="vendor/i18next-text.js"></script>
        <script>
            // See "Browser globals" below for example
        </script>
    </body>
</html>
```

English resource file (i18n/en/resource.json):
```json
{
    "loading": "Loading...",
    "b04ba49f848624bb97ab094a2631d2ad74913498": "Loading..."
}
```

German resource file (i18n/de/resource.json):
```json
{
    "loading": "Wird geladen...",
    "b04ba49f848624bb97ab094a2631d2ad74913498": "Wird geladen..."
}
```

All SHA-1 keys are automatically generated using [i18next-scanner](https://github.com/cheton/i18next-scanner). You do not need to maintain resource files.

### In Node.js
```javascript
var i18n = require('i18next');
var text = require('i18next-text');
var options = {
    lng: 'en',
    preload: ['en', 'de'],
    load: 'current',
    fallbackLng: false,
    resGetPath: 'i18n/__lng__/__ns__.json',
    ns: {
        namespaces: [
            'resource' // default
        ],
        defaultNs: 'resource'
    }
};

// extends i18n object to provide a new _() method
i18n._ = text._;

i18n.init(options, function() {
    i18n.t('loading'); // will return "Loading..."
    i18n._('Loading...', {lng: 'de'}); // will return "Wird geladen..."
});
```

### Browser globals
```javascript
(function(root) {
    var i18n = root.i18n;
    var i18nText = root.i18nText;
    var options = {
        lng: 'en',
        preload: ['en', 'de'],
        load: 'current',
        fallbackLng: false,
        resGetPath: 'i18n/__lng__/__ns__.json',
        ns: {
            namespaces: [
                'resource' // default
            ],
            defaultNs: 'resource'
        }
    };

    // extends i18n object to provide a new _() method
    i18n._ = i18nText._;

    i18n.init(options, function() {
        i18n.t('loading'); // will return "Loading..."
        i18n._('Loading...', {lng: 'de'}); // will return "Wird geladen..."
    });
}(this));
```

### Translation features

[i18next-text](https://github.com/cheton/i18next-text/) supports most [i18next features](http://i18next.com/pages/doc_features.html), for example:

* Access value in different language:
    ```javascript
    i18n._('Loading...', {lng: 'de'}); // will get value in de instead of en
    ```

* Replacing variables:
    ```javascript
    i18n._('YouTube has more than __count__ billion users.', {count: 1});
    ```

Visit [http://i18next.com/pages/doc_features.html](http://i18next.com/pages/doc_features.html) to see more examples.

## Advanced Usage

### Gets the hashed key with a given string
You can call the key() function to get the hashed key with a given string:
```javascript
var text = require('i18next-text');
text.key('Loading...'); // will return 'b04ba49f848624bb97ab094a2631d2ad74913498' in SHA-1
```

### Providing a default key
You can explicitly specify a default key of a text string by passing a `defaultKey` option:
```javascript
i18n._('Loading...', {defaultKey: 'loading'});
i18n._('Loading...', {defaultKey: 'b04ba49f848624bb97ab094a2631d2ad74913498'});
```

Note. Missing resources can be sent to server by turning on i18next's sendMissing option like below:
```javascript
i18n.init({sendMissing: true});
```

### Custom hash function 
You can customize your own hash function by including the [i18next-text.custom.js](https://raw.githubusercontent.com/cheton/i18next-text/master/dist/i18next-text.custom.js) file with only 2KB in size.

Change `hash` on i18nText.init to apply a custom hash function:
```javascript
i18nText.init({
    hash: function(str) {
        return customHashFunction(str);
    }
});
```

## License

Copyright (c) 2015 Cheton Wu

Licensed under the [MIT License](https://github.com/cheton/i18next-text/blob/master/LICENSE).
