var files,
	expect = require( "chai" ).expect,
	fs = require( "fs" ),
	AmdCssBuilder = require( "../index.js" );

files = {
	"foo.js": fs.readFileSync( __dirname + "/fixtures/basic/foo.js" ),
	"bar.js": fs.readFileSync( __dirname + "/fixtures/basic/bar.js" ),
	"foo.css": fs.readFileSync( __dirname + "/fixtures/basic/foo.css" ),
	"bar.css": fs.readFileSync( __dirname + "/fixtures/basic/bar.css" ),
};

describe( "The CSS dependencies of a JS file", function() {
	var css;

	before(function( done ) {
		AmdCssBuilder( files, { include: [ "bar" ] }, function( error, _css ) {
			css = _css;
			done( error );
		});
	});

	it( "must be included", function() {
		expect( css ).to.equal( ".bar {}\n" );
	});

});

describe( "The CSS dependencies of JS dependencies", function() {
	var css;

	before(function( done ) {
		AmdCssBuilder( files, { include: [ "foo" ] }, function( error, _css ) {
			css = _css;
			done( error );
		});
	});

	it( "must be included", function() {
		expect( css ).to.equal( ".foo {}\n.bar {}\n" );
	});

});

describe( "Using appDir", function() {
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

describe( "Using appDir and CSSes located in a different subdir", function() {
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
