var mutex, queue, requireCssFiles,
	fs = require( "fs" ),
	glob = require( "glob" ),
	path = require( "path" ),
	requirejs = require( "requirejs-memfiles" ),
	util = require( "util" );

queue = [];
requireCssFiles = {};

glob.sync( __dirname + "/bower_components/require-css/**", { nodir: true } ).forEach(function( filepath ) {
	requireCssFiles[ filepath.replace( __dirname, "" ).replace( /^\//, "" ) ] = fs.readFileSync( filepath );
});

function enqueueBuildCss() {
	queue.push( arguments );
	if ( queue.length === 1 ) {
		dequeueBuildCss();
	}
}

function dequeueBuildCss() {
	var callback;
	var args = queue[ 0 ];
	if ( args !== undefined ) {
		callback = args[ 2 ];
		args[ 2 ] = function() {
			queue.shift();
			callback.apply( {}, arguments );
			dequeueBuildCss();
		};
		buildCss.apply( {}, args );
	}
}

function buildCss( files, config, callback ) {
	var localCallback, include;

	if ( mutex ) {
		return callback( new Error( "Concurrent calls not supported" ) );
	}
	if ( typeof config !== "object" ) {
		return callback( new Error( "missing or invalid config (object expected)" ) );
	}
	if ( !Array.isArray( config.include ) ) {
		return callback( new Error( "missing or invalid config.include (array expected)" ) );
	}
	mutex = true;
	localCallback = function( error, css ) {
		mutex = false;
		callback( error, css, files );
	};

	include = config.include;
	delete config.include;

	// Include require-css files.
	Object.keys( requireCssFiles ).forEach(function( filepath ) {
		files[ filepath ] = requireCssFiles[ filepath ];
	});

	function normalizePath( _path ) {
		return path.normalize( _path ).replace( /^\//, "" );
	}

	config = util._extend( {}, config );
	config.appDir = config.appDir || ".";
	config.baseUrl = config.baseUrl || ".";
	config.paths = config.paths || {};
	config.paths[ "require-css" ] = path.relative( config.appDir, "bower_components/require-css" );
	config.map = config.map || {};
	config.map[ "*" ] = config.map[ "*" ] || {};
	config.map[ "*" ].css = "require-css/css";
	config.asReference = {
		saveFile: function( path, data ) {
			path = normalizePath( path );
			files[ path ] = data;
		},
		loadFile: function( path ) {
			path = normalizePath( path );
			return files[ path ];
		}
	};
	config.optimizeCss = "none";
	config.separateCSS = true;
	config = util._extend( config, {
		dir: "dist",
		modules: [{
			name: "output",
			include: include,
			create: true
		}]
	});

	requirejs.setFiles( files );
	requirejs.optimize( config, function() {
		localCallback( null, files[ "dist/output.css" ] );
	}, localCallback );
}

/**
 * amdCssBuilder( files, config, callback )
 */
module.exports = function( files, config, callback ) {
	var clonedFiles = {};

	// Clone files + make sure all CSSes are String utf-8.
	Object.keys( files ).forEach(function( path ) {
		if ( /\.css$/i.test( path ) ) {
			clonedFiles[ path ] = files[ path ].toString( "utf-8" );
		} else {
			clonedFiles[ path ] = files[ path ];
		}
	});

	enqueueBuildCss( clonedFiles, config, callback );
};
