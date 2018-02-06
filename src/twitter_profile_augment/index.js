var twitter = require('twitter');

const twit = new twitter({
    consumer_key: process.env.TwitterConsumerKey,
    consumer_secret: process.env.TwitterConsumerSecret,
    access_token_key: process.env.TwitterAccessTokenKey,
    access_token_secret: process.env.TwitterAccessTokenSecret
});

// Function: Handles messages in the toaugment topic, where the platform is 'twitter'
//
// Queries the Instagram API for profile related information

module.exports = function (context, message) {

	context.log({Message: message});

    return twit.get('users/show.json', { user_id: message.social.twitter.id }, function (err, user) {
        let data = message;

        data.response = {
            platform: "twitter",
            type: "profile",
            data: user
        };

		context.log({'Data sent to the queue': data});
        context.bindings.out = data;

        context.done(err);
    });
}