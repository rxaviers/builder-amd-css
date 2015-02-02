## Why builder-amd-css?

Use `builder-amd-css` to generate the CSS bundle of an AMD modular project that
uses the `css!` plugin definitions.

It's ideal for applications that builds bundles on the fly using [Node.js][].

It's not a substitute for css plugins like [require-css][].

[Node.js]: http://nodejs.org/
[require-css]: https://github.com/guybedford/require-css

## Usage

   npm install builder-amd-css

```javascript
var fs = require( "js" );
var amdCssBuilder = require( "builder-amd-css" );

var files = {
  "main.js": fs.readFileSync( "./main.js" ),
  "main.css": fs.readFileSync( "./main.css" ),
  "foo.js": fs.readFileSync( "./foo.js" ),
  "foo.css": fs.readFileSync( "./foo.css" ),
  "bar.js": fs.readFileSync( "./foo.js" ),
  "bar.css": fs.readFileSync( "./bar.css" ),
  ...
}

amdCssBuilder( files, {
  include: "main"
}, function( error, builtCss ) {
  ...
});
```

## API

- **`amdCssBuilder( files, requirejsConfig, callback )`**

**files** *Object* containing (path, data) key-value pairs, e.g.:

```
{
   <path-of-file-1>: <data-of-file-1>,
   <path-of-file-2>: <data-of-file-2>,
   ...
}
```

**requirejsConfig** *Object* [require.js build configuration][

**callback** *Function* called with three arguments: null or an Error object, a
String with the built css content, an Object with the cloned built files
structure.

[require.js build configuration]: https://github.com/jrburke/r.js/blob/master/build/example.build.js

## Test

    npm test

## License

MIT © [Rafael Xavier de Souza](http://rafael.xavier.blog.br)
