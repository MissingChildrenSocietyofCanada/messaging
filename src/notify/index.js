require('dotenv').config();
var util = require('util');

// Function: Handles messages in the toaugment topic
//
// Sends an email to the MCSC HFM team, notifying them of a new trigger

module.exports = function (context, message) {

	context.log({Message: message});

	try {
		var helper = require('sendgrid').mail;

		from_email = new helper.Email(process.env.NotifyEmailFrom);
		to_email = new helper.Email(process.env.NotifyEmailTo);
		subject = "MCSC: Help Find Me Alert";
		var msgContent = util.format("A registered user has triggered HFM and has been added to the dashboard. Please visit the dashboard at the following link: %s", process.env.DashboardURL);
		content = new helper.Content("text/plain", msgContent);
		mail = new helper.Mail(from_email, subject, to_email, content);

		// Set to high importance
		mail.addHeader(new helper.Header("Priority", "Urgent"));
		mail.addHeader(new helper.Header("Importance", "high"));

		var sg = require('sendgrid')(process.env.SendGridAPIKey);
		var requestBody = mail.toJSON();
		var emptyRequest = require('sendgrid-rest').request;
		var requestPost = JSON.parse(JSON.stringify(emptyRequest));
		requestPost.method = 'POST';
		requestPost.path = '/v3/mail/send';
		requestPost.body = requestBody;

		sg.API(requestPost, function (error, response) {
			context.log(response.statusCode);
			context.log(response.headers);
			if (error){
				returnFail(response.statusCode,"Error occurred sending email", context);
			} else {
				returnSuccess(200,"Email sent", context);
			}
			
		});
	}
	catch (error) {
		returnFail(400, error, context);
	}
    
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
