var mutex, requireCssFiles,
	fs = require( "fs" ),
	glob = require( "glob" ),
	path = require( "path" ),
	requirejs = require( "requirejs-memfiles" ),
	util = require( "util" );

requireCssFiles = {};
glob.sync( __dirname + "/bower_components/require-css/**", { nodir: true } ).forEach(function( filepath ) {
	requireCssFiles[ filepath.replace( __dirname, "" ).replace( /^\//, "" ) ] = fs.readFileSync( filepath );
});

function buildCss( files, config, callback ) {
	var localCallback, include;

	if ( mutex ) {
		throw new Error( "Concurrent calls not supported" );
	}
	if ( typeof config !== "object" ) {
		throw new Error( "missing or invalid config (object expected)" );
	}
	if ( !Array.isArray( config.include ) ) {
		throw new Error( "missing or invalid config.include (array expected)" );
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

	config = util._extend( {}, config );
	config.appDir = config.appDir || ".";
	config.baseUrl = config.baseUrl || ".";
	config.paths = config.paths || {};
	config.paths[ "require-css" ] = path.relative( config.appDir, "bower_components/require-css" );
	config.map = config.map || {};
	config.map[ "*" ] = config.map[ "*" ] || {};
	config.map[ "*" ].css = "require-css/css";
	config.asReference = {
		files: files,
		saveFile: function( path, data ) {
			files[ path ] = data;
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

	buildCss( clonedFiles, config, callback );
};
