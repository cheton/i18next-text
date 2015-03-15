# i18next-text [![build status](https://travis-ci.org/cheton/i18next-text.svg?branch=master)](https://travis-ci.org/cheton/i18next-text)

[![NPM](https://nodei.co/npm/i18next-text.png?downloads=true&stars=true)](https://nodei.co/npm/i18next-text/)

Using i18next translations without having the `key` as strings, you do not need to worry about i18n key naming.

It's recommended to use [i18next-scanner](https://github.com/cheton/i18next-scanner) as a Grunt/Gulp task to scan your code, extract and merge translation keys and strings into i18n resource files.

Save your time and work more efficiently!

## Features
* Supports most i18next features.
* Automatically generates a hash for an i18n text string as its unique key. It is not necessary to manually maintain resource files.
* Supports CRC32, MD5, and SHA-1 hash (The default is SHA-1).
* You can customize your own hash function by including the [i18next-text.custom.js](https://raw.githubusercontent.com/cheton/i18next-text/master/dist/i18next-text.custom.js) file with only 2KB in size.

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

// extends i18n object to provide a new _() method
i18n._ = require('i18next-text')._;

i18n.init({/* options */}, function() {
    // Current language is English
    i18n.t('loading'); // will return "Loading..."

    // Change language to German
    i18n.setLng('de');

    i18n._('Loading...'); // will return "Wird geladen..."
});
```

### Browser globals
```html
<script src="vendor/i18next.js"></script>
<script src="vendor/i18next-text.js"></script>
<script>
// extends i18n object to provide a new _() method
i18n._ = i18nText._;

i18n.init({/* options */}, function() {
    // Current language is English
    i18n.t('loading'); // will return "Loading..."
    
    // Change language to German
    i18n.setLng('de');
    i18n._('Loading...'); // will return "Wird geladen..."
});
</script>
```

### Translation features

It supports most i18next features, for example:

* Access value in different language:
    ```javascript
    i18n._('Loading...', {lng: 'de'}); // will get value in de instead of en
    ```

* Replacing variables:
    ```javascript
    i18n._('YouTube has more than __count__ billion users.', {count: 1});
    ```

Visit [http://i18next.com/pages/doc_features.html](http://i18next.com/pages/doc_features.html) to see more examples.

## Initialization

## License

Copyright (c) 2015 Cheton Wu

Licensed under the [MIT License](https://github.com/cheton/i18next-text/blob/master/LICENSE).
