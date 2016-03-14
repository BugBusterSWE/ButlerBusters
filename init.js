// Script per settare i file di configurazione. 
// Verrano creati nella cartella config/ due file access.json contenente le informazioni d'accesso e
// repo_info.json usato per tener traccia di alcune informazioni per facilitare il tracciamento tra 
// le API di Teamwork e quelle di Github.

const fs = require( "fs" );

fs.mkdir( "config", function ( e ) {
    if ( !e ) {
	var config = JSON.parse( fs.readFileSync( "config.json", "utf-8" ) );

	fs.writeFile( "config/access.json", JSON.stringify({
	    user: config.user,
	    pass: config.pass,
            api_key: config.api_key,
            teamwork_website: config.teamwork_website	
	}), "utf-8", function ( e ) {
	    if ( e ) console.log( "Impossibile creare il file access.json" );
	});

	fs.writeFile( "config/repo_info.json", JSON.stringify({
	    users: config.users,
	    organization: config.organization,
	    mail_box: config.mail_box,
	    project: config.project,
	    milestones: {},
	    pending_milestones: {},
	    github_issues: {}
	}), "utf-8", function( e ) {
	    if ( e ) console.log( "Impossibile creare il file repo_info.json" );
	});
    } else {
	console.log( "La configurazione iniziale è già presente" );
    }
});
