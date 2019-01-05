// Packages
const chalk = require( 'chalk' );

// Set up some logging functions
const log = console.log;

const error = ( prefix, str = '' ) => {
	let output = chalk.bold.red( prefix );
	if ( str.length > 0 ) {
		output = chalk.bold.bgRed( prefix ) + ' ' + chalk.bold.red( str );
	}
	log( output );
	log();
	process.exit( 1 );
};

const info = ( str, ...args ) => {
	log( chalk.cyan( str ), ...args );
};

const success = ( str, ...args ) => {
	log( chalk.bold.green( str ), ...args );
	log();
};

const warn = ( str, ...args ) => {
	log( chalk.orange( str ), ...args );
};

module.exports = {
	error,
	info,
	success,
	warn,
};
