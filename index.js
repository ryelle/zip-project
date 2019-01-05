#!/usr/bin/env node
// Node internals
const fs = require( 'fs' );
const path = require( 'path' );

// Packages
const archiver = require( 'archiver' );
const argv = require( 'yargs' )
	.usage( 'Usage: $0 [options]' )
	.describe( 'path', 'Path to your project, defaults to current dir.' )
	.describe( 'output', 'Path to save the zip file, defaults to current dir.' )
	.describe( 'debug', 'Output which files are added to the zip during build.' )
	.alias( 'debug', 'v' )
	.default( 'path', process.cwd() )
	.boolean( 'v' )
	.argv;

// Utilities
const { error, info, success, warn } = require( './log' );

const projectPath = argv.path;
const outputPath = argv.output;
const showDebug = argv.debug;

let pkg;
try {
	const pkgPath = path.resolve( projectPath, 'package.json' );
	pkg = require( pkgPath );
} catch ( e ) {
	error( 'ERROR:', `No package.json found in ${ projectPath }` );
}

// Pull the project name from pacakage.json, falling back to pathname if not found.
const projectName = pkg.name && pkg.name.toLowerCase() || path.basename( projectPath );

// Our project files are pulled from package.json
const files = pkg.files;
if ( ! files || files.length < 1 ) {
	error( 'ERROR:', 'Please add the files you want to publish to an array called `files` in package.json.' );
}

const zipPath = path.resolve( outputPath, `./${ projectName }.zip` );

// create a file to stream archive data to.
const output = fs.createWriteStream( zipPath );

// listen for all archive data to be written
output.on( 'close', () => {
	if ( showDebug ) {
		info( '%s total bytes', archive.pointer() );
	}
	success( `Archive finished, zip available at ${ zipPath }` );
} );

const archive = archiver( 'zip', {
	zlib: { level: 9 }
} );

archive.on( 'warning', ( err ) => {
	if ( err.code === 'ENOENT' ) {
		warn( err );
	} else {
		throw err;
	}
});

archive.on( 'error', ( err ) => {
	throw err;
} );

// send archive data to the output file
archive.pipe( output );

// add each file to the zip
files.map( file => {
	if ( showDebug ) {
		info( `Adding ${ file }` );
	}
	archive.glob( file, { cwd: projectPath } );
} );

info( `Writing to the zip at ${ zipPath }` );
// finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();
