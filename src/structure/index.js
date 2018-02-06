const azure = require('azure-sb');
const topic = "toaugment";

// Function: Handles messages in the tostructure queue
//
// Determines the available socia media feeds that were registered and sends a message to the toaugment topic
// so that the social media information can be collected and stored.

module.exports = function (context, inmessage) {

	// TODO:  Check for token, otherwise the account isn't actually bound
	// TODO:  Trigger all platform toaugment events, rather than just the initial platform trigger

	context.log({Message: inmessage});

    let customProperties = {
        hastwitter: inmessage.user.twitter != undefined,
        hasfacebook: inmessage.user.facebook != undefined,
        hasinstagram: inmessage.user.instagram != undefined,
        platform: inmessage.request.platform
	};
	
	context.log({Properties: customProperties});

    let outmessage = inmessage;

    outmessage.social = {};

    if (customProperties.hastwitter) {
        outmessage.social.twitter = {
            id: inmessage.user.twitter.$id,
            token: inmessage.user.twitter.token,
            username: inmessage.user.twitter.username,
        };
    }

    if (customProperties.hasfacebook) {
        outmessage.social.facebook = {
            id: inmessage.user.facebook.$id,
            token: inmessage.user.facebook.token,
            username: inmessage.user.facebook.email
        };
    }

    if (customProperties.hasinstagram) {
        outmessage.social.instagram = {
            id: inmessage.user.instagram.$id,
            token: inmessage.user.instagram.token,
            username: inmessage.user.instagram.username
        };
    }

    var brokeredMessage = {
		body: JSON.stringify(outmessage),
		customProperties: customProperties
        //customProperties: {
        //    hastwitter: inmessage.user.twitter != undefined,
        //    hasfacebook: inmessage.user.facebook != undefined,
        //    hasinstagram: inmessage.user.instagram != undefined,
        //    platform: inmessage.request.platform
        //}
    }

	context.log({'Data sent to the topic': brokeredMessage});

    let serviceBusService = azure.createServiceBusService(process.env.AzureWebJobsServiceBus);
    serviceBusService.sendTopicMessage(topic, brokeredMessage, function (error) {
		if (error) {
			context.log.error(error);
		}

		context.done(error);
    });
}