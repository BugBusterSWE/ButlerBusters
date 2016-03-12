// This script manage only the closed issue event. When a issues will close
// then the script read the id teamwork task and it will close task request to
// Teamwork. In this way nobody should rembember of to close the task.

const fs = require( "fs" );

exports.main = function ( req, teamwork, github ) {
    var payload = req.body;

    console.log( "Receive issue event" );
    
    if ( payload.action === "closed" ) {
	// ConfigRepo as same as map, foreach issues there is a task and the id
	// issue maps to a teamwork task.
	var configRepo = JSON.parse(
	    fs.readFileSync( "config/repo_info.json", "utf-8" )
	);
	
	var idIssue = payload.issue.id;
	// Get the Teamwork task assiociade at the issue
	var idTask = configRepo["github_issues"][idIssue];
	
	teamwork.closeTask( idTask, function ( error, response, body ) {
	    if ( !error && resonse.statusCode === 200 ) {
		// Remove the map between issue Github and task Teamwork
		delete configRepo["github_issues"][idIssue];
		// Save new status repo
		fs.writeFileSync(
		    "config/repo_info.json",
		    JSON.stringify( configRepo ),
		    "utf-8"
		);
	    } else {
		console.log( "Task with id " + idTask + " not is close" );
	    }
	});
    }
};
