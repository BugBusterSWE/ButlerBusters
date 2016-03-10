var request = require( "request" );

var apiKey;
var teamworkWebsite;

/**
	Get the request to send at teamwork api
	@param request {string} - Message command 
	@return {Object} - The options to send correctly request ( with authentication ) at the teamwork's api
*/
function getTarget( request ) {
	return {
		url: "https://"+apiKey+":xxx@"+teamworkWebsite+"/"+request+".json",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"	
		}
	};
}

/**
	Create a object to use the teamwork's api
	@param authentication {Object} 
		A object with the below parameters:
		- api_key
		- teamwork_website
*/
function TeamWork( authentication ) {
	console.log( "Teamwork create with:" );
	console.log( authentication.api_key + " " + authentication.teamwork_website );
	apiKey = authentication.api_key;
	teamworkWebsite = authentication.teamwork_website;
}

/**	
	Retrieve information to the single task
	@param id {number} - Id task
	@param callback {function} 
		Function to call when the request is finished with below parameters:
		+ error {Object} - information error
		+ status {number} - status code returned
		+ body {Object} - result data
*/
TeamWork.prototype.retrieveTask = function ( id, callback ) {
	request( getTarget( "tasks/"+id ), callback );
};


/**
	Retrieve information to the single task list
	@param id {number} - Id task list
	@param callback {function}
		Function to call when the request is finished with below parameters:
		+ error {Object} - information error
		+ status {number} - status code returned
		+ body {Object} - result data
*/
TeamWork.prototype.retrieveTaskList = function ( id, callback ) {
	request( getTarget( "tasklists/"+id ), callback );	
};

/**
	Retrieve information to the milestone 
	@param id {number} - Id milestone
	@param callback {function}
		Function to call when the request is finished with above parameters:
		+ error {Object} - infomation error
		+ status {number} - status code returned
		+ body {Object} - result data
*/
TeamWork.prototype.retrieveMilestone = function ( id, callback ) {
	request( getTarget( "milestones/"+id ), callback );
};

module.exports = TeamWork;
