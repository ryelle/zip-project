#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const archiver = require( 'archiver' );

const projectPath = process.cwd();

const pkg = require( path.resolve( projectPath, 'package.json' ) );

( function() {
	// Pull the theme name from pacakage.json, falling back to pathname if not found.
	const projectName = pkg.name.toLowerCase() || path.basename( projectPath );

	// Our theme files are pulled from package.json
	const files = pkg.files;
	if ( ! files || files.length < 1 ) {
		console.log( 'ERROR: Please add the files you want to publish to an array called `files` in package.json.' );
		return;
	}

	// create a file to stream archive data to.
	const output = fs.createWriteStream( path.resolve( projectPath, `./${ projectName }.zip` ) );
	const archive = archiver( 'zip', {
		store: true // Sets the compression method to STORE.
	} );

	// listen for all archive data to be written
	output.on( 'close', () => {
		console.log( archive.pointer() + ' total bytes' );
		console.log( 'archiver has been finalized and the output file descriptor has closed.' );
	} );

	// watch for any errors
	archive.on( 'error', function( err ) {
		throw err;
	} );

	// send archive data to the output file
	archive.pipe( output );

	// add each file to the zip
	files.map( file => {
		console.log( `Adding ${file}` );
		archive.glob( file );
	} );

	console.log( `Saving the zip to ./${ projectName }.zip` );
	// finalize the archive (ie we are done appending files but streams have to finish yet)
	archive.finalize();
} )();
