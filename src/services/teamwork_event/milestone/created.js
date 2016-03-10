const fs = require( "fs" );
const request = require( "request" );

exports.main = function ( req, teamwork, github ) {
	var idMilestone = req.body.objectId;

	// Get information of the milestone created
	teamwork.retrieveMilestone( idMilestone, function ( err, response, body ) {
		var info = JSON.parse( body );
		var configRepo = JSON.parse( fs.readFileSync( "config/repo_info.json", "utf-8" ) );

		// Push the new incomplete milestones to create new one when an repo tag will attach to the milestone.
		// Use idMilestone to create a map key value simplifing the extraction.
		configRepo["pending_milestones"][idMilestone] = {
			user: configRepo["organization"],
			repo: "null",
			title: info["milestone"]["title"],
			description: info["milestone"]["description"],
			// Subsitute the data compact format in ISO 8601 format. The hour is not included.
			due_on: info["milestone"]["deadline"].replace( /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3T00:00:00Z" )
		};

		// Save pending milestone
		fs.writeFileSync( "config/repo_info.json", JSON.stringify( configRepo ), "utf-8" );
	});	
};
