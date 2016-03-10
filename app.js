// Capture the substring 'service/grout_event/event'
const PATH_EVENT = /services(\/\w+\/\w+\/\w+).js$/;

var fs = require( "fs" );
var GitHubApi = require( "github" );
// Configuration github 
var github = new GitHubApi({
	// required
	version: "3.0.0"
});

// Read configuration file to access at api github
console.log( "Read file access.json:" );
console.log( fs.readFileSync( "config/access.json", "utf-8" ) );
var access_param = JSON.parse( fs.readFileSync( "config/access.json", "utf-8" ) );

console.log( "GitHub authentication..." );
// Authentication
github.authenticate({
	type: "basic",
	username: access_param.user,
	password: access_param.pass	
}); 
console.log( "Success!!!" );

var recursive = require( "recursive-readdir" );
var express = require( 'express' );
var bodyParser = require( "body-parser" );
var app = express();

// Create wrapper TeamWork API
var TeamWorkApi = require( "./teamwork.js" );
var teamwork = new TeamWorkApi({
	api_key: access_param.api_key,
	teamwork_website: access_param.teamwork_website
});

app.use( bodyParser.json() ); // for parsing application/json
// for parsing application/x-www-form-urlencoded
app.use( bodyParser.urlencoded( { extended: true } ) ); 

app.set( "port", process.env.PORT );

console.log( "Read Teamwork events..." );
// Read all events managed
recursive( "services", function ( err, files ) {
	if ( err ) {
		console.log( "Errors occured:" );
		console.log( JSON.stringify( err ) );
	} else {
		console.log( "Capture events:" );
		files.forEach( function( currentValue, index, array ) {
			// Get the path events
			var path = PATH_EVENT.exec( currentValue )[1];
			// Require the script that it will run when request page of event
			var script = "./services" + path + ".js";
			var event = require( script );
			console.log( "Attach event " + path );
			// Route for the webhook teamwork request
			app.post( path, function( req, res ) {
				// Run script attached at the 'path' event
				event.main( req, teamwork, github );
				console.log( "Acknowledge with status 200" );
				res.status( 200 ).send( "OK" );	
			});
		});

		console.log( "All events synchronized with success!!!" );
	}
});

app.listen( app.get( "port" ), function() {
    console.log( "App listening in port " + app.get( "port" );
});
