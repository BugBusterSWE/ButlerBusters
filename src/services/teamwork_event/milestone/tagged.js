const fs = require( "fs" );

exports.main = function ( req, teamwork, github ) {
	var idMilestone = req.body.objectId;
	
	// Retrive the milestone with attacched the repo tag
	teamwork.retrieveMilestone( idMilestone, function ( err, response, body ) {
		if ( !err && response.statusCode === 200 ) {
			var info = JSON.parse( body );
			var configRepo = JSON.parse( fs.readFileSync( "config/repo_info.json", "utf-8" ) );
			// Get the milestone incomplete
			var pendingMilestone = configRepo["pending_milestones"][idMilestone];
			// Get the first ( and only one ) tag.
			// Catch the string forwarded the character '$' to discern by other tag and check if was received corret tag.
			var group = /^\$(\w+)$/.exec( info["milestone"]["tags"][0]["name"] );
			
			if ( group != null ) {
				// Extract name of repo
				var repo = group[1];
				pendingMilestone["repo"] = repo;

				github.issues.createMilestone( pendingMilestone, function( err, res ) {
					// Create milesone with success
					if ( !err ) {
						// Move the pending milestone in section milestone save only repo and 
						// GitHub number
						configRepo["milestones"][idMilestone] = {
							repo: repo,
							number: res.number
						};
						
						// Remove pending milestone 
						delete configRepo["pending_milestones"][idMilestone];
						console.log( configRepo );

						fs.writeFileSync( "config/repo_info.json", JSON.stringify( configRepo ), "utf-8" );						
					}
				});
			} else { 
				console.log( "Incorrect tag " + info["milestone"]["tags"][0]["name"] );
			}
		} else {
			console.log( "Error tag milestone" );
		}	
	});
};
