const fs = require( "fs" );

exports.main = function ( req, teamwork, github ) {
    var idMilestone = req.body.objectId;

    var configRepo = JSON.parse( fs.readFileSync( "config/repo_info.json", "utf-8" ) );
    
    var postMessage = {
	"category-id": configRepo["mail_box"],
	"notify": [""],
	"private": 0,
	"attachments": "",
	"pendingFileAttachments": "",
	"tags": ""
    };
    
    // Retrive the milestone with attacched the repo tag
    teamwork.retrieveMilestone( idMilestone, function ( err, response, body ) {
	if ( !err && response.statusCode === 200 ) {
	    var info = JSON.parse( body );
	    // Get the milestone incomplete
	    var pendingMilestone = configRepo["pending_milestones"][idMilestone];
	    // Get the first ( and only one ) tag.
	    // Catch the string forwarded the character '$' to discern by other
	    // tag and check if was received corret tag.
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
			fs.writeFileSync( "config/repo_info.json", JSON.stringify( configRepo ), "utf-8" );

			postMessage.title =
			    "Milestone create nel repo " +
			    repo;
			postMessage.body =
			    "La milestone pendente e' stata " +
			    "create con successo";
		    }
		});
	    } else {
		postMessage.title = "Tag milestone errata";
		postMessage.body =
		    "Il seguente tag " +
		    info["milestone"]["tags"][0]["name"] + " e' invalido." +
		    " La milestone non potra essere creata.";
	    }
	} else {
	    postMessage.title =
		"Impossibile ottenere l'id della milestone" +
		"taggata";
	    postMessage.body = "La milestone non puo' essere create perche' le" +
		" API di Teamwork hanno riscontrato il seguente errore: " +
		JSON.stringify( err );
	}

	// Send to message with the abstract of state
	teamwork.sendMessage(
	    configRepo["project"],
	    postMessage,
	    function ( error, response, body ) {
		if ( !error && response.statusCode === 201 ) {
		    console.log( "Message sended with success" );
		} else {
		    console.log(
			"Error send messages, status " + response.statusCode
		    );
		}
	});
    });
};
