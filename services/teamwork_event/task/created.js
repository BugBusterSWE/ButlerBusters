const fs = require( "fs" );
const Promise = require( "promise" );
const request = require( "request" );

exports.main = function ( req, teamwork, github ) {
    console.log( "==================================================" );
    console.log( "Task created event occurred" );
    var idTask = req.body.objectId;

    teamwork.retrieveTask( idTask, function( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            var info = JSON.parse( body );

	    console.log( info );
	    
            // Read all needed information to create a new issue
            var configRepo = JSON.parse( fs.readFileSync( "config/repo_info.json", "utf-8" ) );

            // Message to send at github for create a new issue
            var issueGithub = {
                user: configRepo["organization"],
                repo: "",
                title: info["todo-item"]["content"],
                body: info["todo-item"]["description"] + "\n\nLink task: ",
                assignee: configRepo["users"][info["todo-item"]["responsible-party-id"]],
                milestone: "",
                labels: []
            };

	    // First get the milestone because it have the name of repo needed to ceate labels
            var getMilestone = new Promise( function ( resolve, reject ) {
                teamwork.retrieveTaskList( info["todo-item"]["todo-list-id"], function ( err, response, body ) {
		    console.log( "Task/created: retrieve milestone saved" );
                    if ( !err && response.statusCode === 200 ) {
                        var todoList = JSON.parse( body );
			console.log( "Task/created: done" );
                        // Get the milestone's number
                        resolve( configRepo["milestones"][todoList["todo-list"]["milestone-id"]] );
                    } else {
			console.log( "Task/created: fail" );
                        reject( err );
                    }
                });
            });

            getMilestone.then( function ( value ) {
		// Any milestone attacched at the activity  
		if ( value.repo == undefined ) {
		    throw "not_set_milestone";
		} else {
		    issueGithub.repo = value.repo;
                    issueGithub.milestone = value.number;

                    // Get the issue associate at this task
                    var getLabels = new Promise( function ( resolve, reject ) {
			var labelsPromised = [];
			// Labels attached at the task
			var completeLabels = info["todo-item"]["tags"];

			if ( completeLabels == undefined ) {
                            reject( "No labels setted" );
			}

			console.log( "Task/created: get all labels from Teamwork task" );
			// Crete one promise for each label attach at the task
			completeLabels.forEach( function ( currentValue, index, array ) {
                            labelsPromised.push( new Promise( function ( resolve, reject ) {
				// Request to get a label with the same name of the teamwork's label
				github.issues.getLabel({
                                    user: issueGithub.user,
                                    repo: issueGithub.repo,
                                    name: currentValue.name
				}, function ( err, res ) {
                                    // The tag not exists in the repo
                                    if ( err ) {
					// Crete a new label
					github.issues.createLabel({
                                            user: issueGithub.user,
                                            repo: issueGithub.repo,
                                            name: currentValue.name,
                                            // Remove the '#' character in the color
                                            color: currentValue.color.substring( 1 )
					}, function ( err, res ) {
                                            if ( err ) {
						// The error to catch in the createUnrealLabel promise  
						reject( err ); 
                                            } else {
						resolve( currentValue.name );
                                            }
					});
					// If exist it will append at the result
                                    } else {
					resolve( currentValue.name );
                                    }
				});
                            }));
			});

			// Get all labels created or manage the error occurred
			Promise.all( labelsPromised )
                            .then( function ( values ) {
				resolve( values );
                            }).catch( function ( err ) {
				reject( err );
                            }); 
                    });

                    // Get all labels setted in the task
                    getLabels.then( function ( value ) {
			console.log( "Task/created: attach labell at the Github issue" );
			// Complete issue
			issueGithub.labels = value;
			console.log( "Task/created: create issue on Github" );
			github.issues.create( issueGithub, function ( err, res ) {
                            // Catch this exception in the below catch body
                            if ( err ) {
				throw err;
			    } else {
				// Map id github issue with id teamwork task
				configRepo["github_issues"][res.id] = info["todo-item"]["id"];
				// Save in config file
				fs.writeFileSync( "config/repo_info.json", JSON.stringify( configRepo ), "utf-8" );
			    }
			});
                    }).catch( function ( err ) {
			// Throw err to catch in the catch body
			throw err;
                    });
		}
            }).catch( function ( err ) {
                console.log( err );
            });
        } else {
            console.log( "Error occured" );
        }
	console.log( "==================================================" );
    });
};
