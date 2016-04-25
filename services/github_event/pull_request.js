const fs = require("fs");

/**
 * Search the member assigned at the pull request
 * 
 * @param members {Object} JSON where search the member, format expected:
 *      {
 *          "member": {
 *              ...
 *              count: number
 *          }
 *      }
 * 
 * @param pullReq {Object} Informations to identify the pull request:
 * {
 *      "number": num,
 *      "repo": name_repo
 * }
 * 
 * @return {number} 
 * Position of the member assigned at the pull request if value > 0, 
 * -1 otherwise
 */
function removePull(members, pullReq) {
    var found = false;
    var keys = Object.keys(members);
    var pos = 0;
    var length = keys.length;
    var member = {};
    
    while (!found || pos < length) {
        member = members[keys[pos]];
        
        var index = -1;
        var i = 0;
        
        while (index < 0 && i < member.pull.length) {
            var pull = member.pull[i];
            
            if (
                pull.number === pullReq.number && 
                pull.repo === pullReq.repo
            ) {
                index = i;
            } 
            
            i++;
        }
        
        if ( index >= 0 ) {
            found = true;
            // Remove pull request assigned
            member.pull.splice(index,1);
            member.count--;
        } else {
            pos++;
        }
    }
}


exports.main = function ( req, teamwork, github ) 
    var payload = req.body;
    var pullRequest = payload.pull_request;
    
    var counter = JSON.parse(fs.readFileSync("service/github_event/counter.json","utf-8"));
    var assignee = 0;
    
    if (payload.action === "opened") {
        var minPull = Number.MAX_VALUE;
        var pos = -1;
        var keys = Object.keys(counter);
        var length = keys.length;
        var selected = {};
        
        for (var i = 0; i < length; i++) {       
            selected = counter[keys[i]];
            
            if (
                pullRequest.user.login !== keys[i] && 
                selected.count < minPull
            ) {
                pos = i;
                minPull = selected.count;
            }
        }
        
        assignee = keys[pos]; 

        var member = counter[assignee];
        member.count++;
        member.pull.push({
            "number": pullRequest.number,
            "repo": pullRequest.head.repo.name
        }); 
           
    } else if (payload.action === "assigned") {
        var identify = {
            "number": pullRequest.number,
            "repo": pullRequest.head.repo.name
        };
        
        removePull(counter, identify);
        
        assignee = pullRequest.user.login;

        var member = counter[assignee];
        
        member.count++;
        member.pull.push(identify);    
    }
    
    fs.writeFileSync("service/github_event/counter.json",JSON.stringify(
        counter,
        null,
        "\t"
    ),"utf-8");

    github.issues.edit({
        "user": "BugBusterSWE",
        "repo": pullRequest.head.repo.name,
        "number": pullRequest.number,
        "assignee": assignee
    }, function(err, res) {
    });
} 

