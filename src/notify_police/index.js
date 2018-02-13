require('dotenv').config();
var util = require('util');

// Function: Trigger via HTTP request
//
// Sends an email to the supplied email address, with an access token.  Saves the access token to the database, 
// under the reporting database / accessTokens collection.

module.exports = function (context, req) {

    if (typeof req.body != 'undefined' && typeof req.body == 'object') {

		var myReq = req.body;
        var myToken = new oAccessToken(myReq.userid, myReq.email, guid());

		context.log({Request: myReq});

        //save to document db
        context.bindings.out = myToken;

        //send mail and return
        sendMail(myToken.userid, myToken.email, myToken.accesstoken, context);
        
    } else {
		var statusCode = 400;
		var responseBody = "Invalid request object";
		returnFail(statusCode,responseBody,context);
    }

}



function sendMail(userid, email, token, context) {

	try {
	    context.log('Sending notification to %s for user id %s', email, userid);

		var toEmail = email;
		var userId = userid
		var userToken = token;
		var profileUrl = util.format("%s%s?access_token=%s", process.env.DashboardProfileUrl, userId, userToken);

		//console.log('------>' + profileUrl);

		var msgContent = util.format("Please view the profile here: %s", profileUrl);

		var helper = require('sendgrid').mail;

		from_email = new helper.Email(process.env.NotifyEmailFrom);
		to_email = new helper.Email(toEmail);
		subject = "Missing Children Society of Canada: Help Find Me Alert";
		content = new helper.Content("text/plain", msgContent);
		mail = new helper.Mail(from_email, subject, to_email, content);

		// Set to high importance
		mail.addHeader(new helper.Header("Priority", "Urgent"));
		mail.addHeader(new helper.Header("Importance", "high"));

		var sg = require('sendgrid')(process.env.SendGridAPIKey);
		var requestBody = mail.toJSON();
		var emptyRequest = require('sendgrid-rest').request;
		var requestPost = JSON.parse(JSON.stringify(emptyRequest));

		requestPost.path = '/v3/mail/send';
		requestPost.body = requestBody;

		sg.API(requestPost, function (error, response) {
			if (error){
				returnFail(response.statusCode,"Error occurred sending email", context);
			} else {
				returnSuccess(201,"Access Token Created, Email sent", context);
			}
		})
	}
	catch (error) {
		returnFail(400, error, context);
	}
}

function oAccessToken(userid, email, accesstoken) {
    this.userid = userid;
    this.email = email;
    this.accesstoken = accesstoken;
    this.expires = getCurrentDate();
}

function getCurrentDate() {
    var dateTime = require('node-datetime');
    var dt = dateTime.create();
    dt.offsetInDays(1);
    var formatted = dt.format('Y-m-d H:M:S');
    return formatted;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

//helper function to set response code and message and complete the function (context.done())
function returnSuccess(statusCode, Message, context){
        var defaultstatusCode = 201;
        var defaultresponseBody = "Access Token Created, Email Sent";
        context.res = { status : (statusCode?statusCode:defaultstatusCode),
                        body: (Message?Message:defaultresponseBody)};
        context.done();
}

//helper function to set response code and message and complete the function (context.done())
function returnFail(statusCode,Message,context){
        var defaultstatusCode = 400;
        var defaultresponseBody = "Invalid request object";
        context.res = { status : (statusCode?statusCode:defaultstatusCode),
						body: (Message?Message:defaultresponseBody)};
		context.log.error(Message?Message:defaultresponseBody);
        context.done(Message);
}