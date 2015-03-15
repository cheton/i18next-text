# i18next-text [![build status](https://travis-ci.org/cheton/i18next-text.svg?branch=master)](https://travis-ci.org/cheton/i18next-text)

[![NPM](https://nodei.co/npm/i18next-text.png?downloads=true&stars=true)](https://nodei.co/npm/i18next-text/)

Using i18next translations without having the `key` as strings, you do not need to worry about i18n key naming. Save your time and work more efficiently.
It's recommended to use [i18next-scanner](https://github.com/cheton/i18next-scanner) as a Grunt/Gulp task to scan your code, extract and merge translation keys and strings to i18n resource files.

## Features
* Generates a hash for an i18n text string as its unique key.
* Supports CRC32, MD5, and SHA-1 hash (The default is SHA-1).
* You can customize your own hash function by including the (i18next-text.custom.js)[https://raw.githubusercontent.com/cheton/i18next-text/master/dist/i18next-text.custom.js] file with only 2KB in size.

## Usage

For example, assume that you have the following directory structure:
```
vendor/
    i18next.js
    i18next-text.js
i18n/
    en/
        resource.json
    de/
        resource.json
index.html
```

English resource file:
```json
{
    "loading": "Loading...",
    "b04ba49f848624bb97ab094a2631d2ad74913498": "Loading..."
}
```

German resource file:
```json
{
    "loading": "Wird geladen...",
    "b04ba49f848624bb97ab094a2631d2ad74913498": "Wird geladen..."
}
```

### In Node.js
```javascript
var i18n = require('i18next');
var text = require('i18next-text');

// extends i18n object to provide a new _() method
i18n._ = text._;

i18n.init({/* initialization options */}, function() {
    // Current language is English
    console.log(i18n.t('loading')); // It will display "Loading..."

    // Change current language to German
    i18n.setLng('de');

    console.log(i18n._('Loading...')); // It will display "Wird geladen..."
});
```

### Browser globals
```html
&lt;script src="vendor/i18next.js">&lt;/script&gt;
&lt;script src="vendor/i18next-text.js">&lt;/script&gt;
&lt;script&gt;
// extends i18n object to provide a new _() method
i18n._ = i18nText._;

i18n.init({/* initialization options */}, function() {
    // Current language is English
    console.log(i18n.t('loading')); // It will display "Loading..."

    // Change current language to German
    i18n.setLng('de');

    console.log(i18n._('Loading...')); // It will display "Wird geladen..."
});
</script>
```

## Options

## License

Copyright (c) 2015 Cheton Wu

Licensed under the [MIT License](https://github.com/cheton/i18next-text/blob/master/LICENSE).
