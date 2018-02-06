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
			if (error) {
				context.log.error("Error occurred sending email: ", error);
			} else {
				context.log("Email sent.");
			}
			
			context.done(error);
		});
	}
	catch (error) {
		context.log.error("Error occurred sending email: ", error);
		context.done(error);
	}
    
}
