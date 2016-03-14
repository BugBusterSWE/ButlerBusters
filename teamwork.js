var request = require( "request" );

var apiKey;
var teamworkWebsite;

/**
   Get the request to send at teamwork api
   @param request {string} - Message command 
   @param method {string} - Optional. Method HTTP to send a request. Default is set to GET.
   @param body {Object} - Optional. Payload of the request. Default is set to '{}'.
   @return {Object} - The options to send correctly request ( with authentication ) at the teamwork's api
*/
function getTarget( request, method, body ) {
    method = method || "GET";
    body = body || {};
    
    return {
	url: "https://"+apiKey+":xxx@"+teamworkWebsite+"/"+request+".json",
	method: method,
	body: JSON.stringify( body ),
	
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
    apiKey = authentication.api_key;
    teamworkWebsite = authentication.teamwork_website;
}

/**	
	Retrieve information to the single task
	@param id {number} - Id task
	@param callback {function} 
	Function to call when the request is finished with below parameters:
	+ error {Object} - information error
	+ response {Object} - Object to rappresent the payload sended from receiver
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
   + response {Object} - Object to rappresent the payload sended from receiver
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
   + response {Object} - Object to rappresent the payload sended from receiver
   + body {Object} - result data
*/
TeamWork.prototype.retrieveMilestone = function ( id, callback ) {
    request( getTarget( "milestones/"+id ), callback );
};

/**
   Mark the task with id, it passed as arguments, as complete
   @param id {number} - Id task
   @param callback {function} - 
   Function to call when the request is finished with below parameters:
   + error {Object} - Information error
   + response {Object} - Object to rappresent the payload sended from receiver
   + body {Object} - result data
*/
TeamWork.prototype.closeTask = function( id, callback ) {
    request( getTarget( "tasks/"+id+"/complete", "PUT" ), callback );
};

/**
   Send message at the project with the id passed as argument.
   @param projectId {number} - Id project
   @param post {Object} - Object with parameters needed to send message
   @param callback {function}
   Function to call when the request is finished with below parameters:
   + error {Object} - Information error
   + response {Object} - Object to rappresent the payload sended from receiver
   + body {Object} - result data
*/
TeamWork.prototype.sendMessage = function ( projectId, post, callback ) {
    request(
	getTarget( "projects/"+projectId+"/posts", "POST", { post: post } ),
	callback
    );
};


module.exports = TeamWork;
