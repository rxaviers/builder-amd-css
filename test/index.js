var files,
	async = require( "async" ),
	expect = require( "chai" ).expect,
	fs = require( "fs" ),
	AmdCssBuilder = require( "../index.js" );

files = {
	"foo.js": fs.readFileSync( __dirname + "/fixtures/basic/foo.js" ),
	"bar.js": fs.readFileSync( __dirname + "/fixtures/basic/bar.js" ),
	"foo.css": fs.readFileSync( __dirname + "/fixtures/basic/foo.css" ),
	"bar.css": fs.readFileSync( __dirname + "/fixtures/basic/bar.css" ),
};

describe( "CSS dependencies of a JS file", function() {
	var css;

	before(function( done ) {
		AmdCssBuilder( files, { include: [ "bar" ] }, function( error, _css ) {
			css = _css;
			done( error );
		});
	});

	it( "should be included", function() {
		expect( css ).to.equal( ".bar {}\n" );
	});

});

describe( "CSS dependencies of JS dependencies", function() {
	var css;

	before(function( done ) {
		AmdCssBuilder( files, { include: [ "foo" ] }, function( error, _css ) {
			css = _css;
			done( error );
		});
	});

	it( "should be included", function() {
		expect( css ).to.equal( ".foo {}\n.bar {}\n" );
	});

});

describe( "Property appDir", function() {
	var css, files;

	files = {
		"fixtures/foo.js": fs.readFileSync( __dirname + "/fixtures/basic/foo.js" ),
		"fixtures/bar.js": fs.readFileSync( __dirname + "/fixtures/basic/bar.js" ),
		"fixtures/foo.css": fs.readFileSync( __dirname + "/fixtures/basic/foo.css" ),
		"fixtures/bar.css": fs.readFileSync( __dirname + "/fixtures/basic/bar.css" ),
	};

	before(function( done ) {
		AmdCssBuilder( files, { appDir: "fixtures", include: [ "foo" ] }, function( error, _css ) {
			css = _css;
			done( error );
		});
	});

	it( "should work just fine", function() {
		expect( css ).to.equal( ".foo {}\n.bar {}\n" );
	});

});

describe( "Property appDir plus CSSes located in a sibling subdir", function() {
	var css, files;

	files = {
		"a/foo.js": fs.readFileSync( __dirname + "/fixtures/css-elsewhere/a/foo.js" ),
		"a/bar.js": fs.readFileSync( __dirname + "/fixtures/css-elsewhere/a/bar.js" ),
		"b/foo.css": fs.readFileSync( __dirname + "/fixtures/css-elsewhere/b/foo.css" ),
		"b/bar.css": fs.readFileSync( __dirname + "/fixtures/css-elsewhere/b/bar.css" ),
	};

	before(function( done ) {
		AmdCssBuilder( files, { appDir: "a", include: [ "foo" ] }, function( error, _css ) {
			css = _css;
			done( error );
		});
	});

	it( "should work just fine", function() {
		expect( css ).to.equal( ".foo {}\n.bar {}\n" );
	});

});

describe( "Serial runs", function() {
	var barCss, fooCss;

	before(function( done ) {
		async.series([
			function( callback ) {
				AmdCssBuilder( files, { include: [ "bar" ] }, callback );
			},
			function( callback ) {
				AmdCssBuilder( files, { include: [ "foo" ] }, callback );
			}
		], function( error, result ) {
			if ( error ) {
				return done( error );
			}
			barCss = result[ 0 ][ 0 ];
			fooCss = result[ 1 ][ 0 ];
			done();
		});
	});

	it( "should work just fine", function() {
		expect( barCss ).to.equal( ".bar {}\n" );
		expect( fooCss ).to.equal( ".foo {}\n.bar {}\n" );
	});

});

describe( "Concurrent runs", function() {
	var barCss, fooCss;

	before(function( done ) {
		async.parallel([
			function( callback ) {
				AmdCssBuilder( files, { include: [ "bar" ] }, callback );
			},
			function( callback ) {
				AmdCssBuilder( files, { include: [ "foo" ] }, callback );
			}
		], function( error, result ) {
			if ( error ) {
				return done( error );
			}
			barCss = result[ 0 ][ 0 ];
			fooCss = result[ 1 ][ 0 ];
			done();
		});
	});

	it( "should be enqueued", function() {
		expect( barCss ).to.equal( ".bar {}\n" );
		expect( fooCss ).to.equal( ".foo {}\n.bar {}\n" );
	});

});

describe( "Property onCssBuildWrite", function() {
	var css;

	before(function( done ) {
		AmdCssBuilder( files, {
			include: [ "foo" ],
			onCssBuildWrite: function( path, data ) {
				if ( /bar/.test( path ) ) {
					data = data.replace( /bar/, "baz" ).replace( /foo/, "qux" );
				}
				return data;
			}
		}, function( error, _css ) {
			css = _css;
			done( error );
		});
	});

	it( "should allow rewriting CSS content analogous to onBuildWrite for JS", function() {
		expect( css ).to.equal( ".foo {}\n.baz {}\n" );
	});

});

