var util = require('util');

const DocumentDBClient = require('documentdb').DocumentClient;
const config = {
    CollLink: 'dbs/reporting/colls/accesstokens',
    Host: process.env.DocumentDB_Host,
    AuthKey: process.env.DocumentDB_AuthKey,
};

// Function: Trigger via HTTP request
//
// Validates the access token / user id combination supplied in the request.

module.exports = function (context, req) {

    var statusCode = 400;
    var responseBody = "Invalid request object";

    //something was passed in
    if (typeof req.body != 'undefined' && typeof req.body == 'object') {

		try {
			var myReq = req.body;

			context.log({Request: req});

			var myAccess = new AccessRequest(myReq.userid, myReq.token);

			const docDbClient = new DocumentDBClient(config.Host, { masterKey: config.AuthKey });
			const query = util.format('SELECT * FROM c where c.accesstoken=\'%s\' and c.userid=\'%s\'', myAccess.token, myAccess.userid);

			const options = {
				enableCrossPartitionQuery: true
			}

			docDbClient.queryDocuments(config.CollLink, query, options).toArray(function (err, results) {
				var accessResult = "false";

				if (results.length == 0) {
					context.log("Document does not exist; unverified access token");
				} else {
					context.log("Document exists; verified access token");
					accessResult = "true";
				}

				statusCode = "200";
				context.bindings.res = accessResult;
				context.res = { status : statusCode, body: accessResult};
				context.done();
			});
		}
		catch (error) {
			context.res = { status : statusCode, body: error};
			context.log.error(error);
			context.done(error);
		}
	}
	else {
		context.res = { status : 200, body: "false"};
		context.log.warn('No request body information was supplied.')
		context.done();
	}
};

function AccessRequest(userid, token) {
    this.userid = userid;
    this.token = token;
}