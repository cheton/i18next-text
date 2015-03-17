# i18next-text [![build status](https://travis-ci.org/cheton/i18next-text.svg?branch=master)](https://travis-ci.org/cheton/i18next-text)

[![NPM](https://nodei.co/npm/i18next-text.png?downloads=true&stars=true)](https://nodei.co/npm/i18next-text/)

Using [i18next](http://i18next.com/) translations without having the `key` as strings, you do not need to worry about i18n key naming.

It's recommended to use [i18next-scanner](https://github.com/cheton/i18next-scanner) as a Grunt/Gulp task to scan your code, extract and merge translation keys and strings into i18n resource files.

Save your time and work more efficiently!

## Features
* Supports most [i18next features](http://i18next.com/pages/doc_features.html).
* Provides built-in support for Handlebars i18n helper.
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
var i18nText = require('i18next-text');
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
var i18nText = require('i18next-text');
i18nText.key('Loading...'); // will return 'b04ba49f848624bb97ab094a2631d2ad74913498' in SHA-1
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
You can customize your own hash function by including the [i18next-text.custom.js](https://raw.githubusercontent.com/cheton/i18next-text/master/dist/i18next-text.custom.js) file, which is only 2KB in size:
```html
<script src="vendor/i18next.js"></script>
<script src="vendor/i18next-text.custom.js"></script>
```

In your initialization script, change `hash` on i18nText.init() to apply a custom hash function:
```javascript
i18nText.init({
    hash: function(str) {
        return customHashFunction(str);
    }
});
```

## Template & Helpers

### Handlebars i18n helper

Use the Handlebars.registerHelper method to register the `i18n` helper:
```javascript
var i18nText = require('i18next-text');
var handlebars = require('handlebars');

handlebars.registerHelper('i18n', i18nText.handlebarsHelper);
```

By default, Handlebars will escape the returned result by default.
If you want to generate HTML, you have to return a `new Handlebars.SafeString(result)`.
In such a circumstance, you will want to manually escape parameters like so:
```javascript
var i18nText = require('i18next-text');
var handlebars = require('handlebars');

handlebars.registerHelper('i18n', function() {
    var result = i18nText.handlebarsHelper.apply(this, arguments);
    return new handlebars.SafeString(result);
});
```

Usage in template:
```html
{{i18n 'Basic Example'}}
{{i18n '__first-name__ __last-name__' first-name=firstname last-name=lastname}}
{{i18n 'English' defaultKey='locale:language.en-US'}}
{{i18n defaultKey='loading'}}
{{#i18n}}Some text{{/i18n}}
{{#i18n this}}Description: {{description}}{{/i18n}}
{{#i18n this last-name=lastname}}{{firstname}} __last-name__{{/i18n}}
```

You can compile the template string into a Handlebars template function, and then render the template by passing a data object (a.k.a. context) into that function:
```javascript
var source = fs.readFileSync('./handlebars-helper-i18n.hbs'), 'utf-8');
var template = handlebars.compile(source);
var context = {
    'firstname':'Foo',
    'lastname':'Bar',
    'description': 'Foo Bar Test'
};
console.log(template(context));
```

You will see console output like so:
```
Basic Example
Foo Bar
English
Loading...
Some text
Description: Foo Bar Test
Foo Bar
```

## License

Copyright (c) 2015 Cheton Wu

Licensed under the [MIT License](https://github.com/cheton/i18next-text/blob/master/LICENSE).
