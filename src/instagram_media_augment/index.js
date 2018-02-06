let ig = require('instagram-node');

// Function: Handles messages in the toaugment topic, where the platform is 'instagram'
//
// Queries the Instagram API for media related information

module.exports = function (context, message) {
	
	context.log({Message: message});

	let client = ig.instagram();

    client.use({ access_token: message.social.instagram.token });

    client.media(message.request.mediaid, function (err, result) {
        let data = message;

        data.response = {
            platform: "instagram",
            type: "media",
            data: result
        };

		context.log({'Data sent to the queue': data});
        context.bindings.out = data;

        context.done(err);
    });
};