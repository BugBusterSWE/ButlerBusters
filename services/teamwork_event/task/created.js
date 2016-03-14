const fs = require( "fs" );
const Promise = require( "promise" );
const request = require( "request" );

exports.main = function ( req, teamwork, github ) {
    var idTask = req.body.objectId;

    // Read all needed information to create a new issue
    var configRepo = JSON.parse( fs.readFileSync( "config/repo_info.json", "utf-8" ) );
    
    var postMessage = {
	"category-id": configRepo["mail_box"],
	"notify": [""],
	"private": 0,
	"attachments": "",
	"pendingFileAttachments": "",
	"tags": ""
    };

    var createTask = new Promise( function ( fulfill, reject ) {
	teamwork.retrieveTask( idTask, function( error, response, body ) {
            if ( !error && response.statusCode == 200 ) {
		var info = JSON.parse( body );
		var access = JSON.parse( fs.readFileSync( "config/access.json", "utf-8" ) );
		var linkTask = "https://"+access.teamwork_website+"/tasks/"+info["todo-item"]["id"];
		
		// Message to send at github for create a new issue
		var issueGithub = {
                    user: configRepo["organization"],
                    repo: "",
                    title: info["todo-item"]["content"],
                    body: info["todo-item"]["description"] + "\n\nLink task: ["+linkTask+"]("+linkTask+")",
                    assignee: configRepo["users"][info["todo-item"]["responsible-party-id"]],
                    milestone: "",
                    labels: []
		};

		// First get the milestone because it have the name of repo needed to ceate labels
		var getMilestone = new Promise( function ( resolve, reject ) {
                    teamwork.retrieveTaskList( info["todo-item"]["todo-list-id"], function ( err, response, body ) {
			if ( !err && response.statusCode === 200 ) {
                            var todoList = JSON.parse( body );
                            // Get the milestone's number
                            resolve( configRepo["milestones"][todoList["todo-list"]["milestone-id"]] );
			} else {
			    postMessage.title =
				"Impossibile ottenere le " +
				"informazioni sull'attivita'";
			    postMessage.body =
				"E' stato riscontrato il seguente errore: " +
				JSON.stringify( err );
                            reject( err );
			}
                    });
		});

		getMilestone.then( function ( value ) {
		    // Any milestone attacched at the activity  
		    if ( value.repo == undefined ) {
			postMessage.title = "Nessuna milestone legata a questo task";
			postMessage.body =
			    "Si e' tentato di creare un task senza una " +
			    "milestone assiociata. Legare all'attivita' una " +
			    "milestone. La issue non verra' creata";
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
				postMessage.title = "Nessuna label settata";
				postMessage.body =
				    "E' necessario fornire almeno una label " +
				    "per i task. La issue non verra' creata";
				reject( "No labels setted" );
			    }

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
						    postMessage.title =
							"Impossibile creare il tag " + currentValue.name;
						    postMessage.body =
							"Errore riscontrato " + JSON.stringify( err ) +
							"\n La issue non verra' creata.";
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
			    // Complete issue
			    issueGithub.labels = value;
			    github.issues.create( issueGithub, function ( err, res ) {
				// Catch this exception in the below catch body
				if ( err ) {
				    throw err;
				} else {
				    // Map id github issue with id teamwork task
				    configRepo["github_issues"][res.id] = info["todo-item"]["id"];
				    // Save in config file
				    fs.writeFileSync(
					"config/repo_info.json",
					JSON.stringify( configRepo ),
					"utf-8"
				    );

				    postMessage.title = "Task creato con successo";
				    postMessage.body =
					"Il task " +
					issueGithub.title + "e' stato " +
					"correttamente creato nel repo " +
					issueGithub.repo;

				    fulfill();
				}
			    });
			}).catch( function ( err ) {
			    // Throw err to catch in the catch body
			    throw err;
			});
		    }
		}).catch( function ( err ) {
		    fulfill();
		});
            } else {
		postMessage.title = "Impossibile ottenere l'id del task";
		postMessage.body =
		    "Le API di Teamwork hanno riscontrato un " +
		    "errore nell'ottenere l'id del task. Impossibile creare " +
		    "il task " + issueGithub.title;

		fulfill();
            }
	});
    });
    

    createTask.then( function() {
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
