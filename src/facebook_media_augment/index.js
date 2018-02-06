var request = require('request-promise');

// Function: Handles messages in the toaugment topic, where the platform is 'facebook'
//
// Queries the Facebook Graph API for media related information

module.exports = function (context, message) {

	context.log({Message: message});

    let path = '/' + message.request.mediaid + '?fields=id,message,message_tags,application,created_time,picture,place,name,comments,reactions,object_id,privacy,properties,shares,status_type,story,story_tags,updated_time,with_tags';

    let options = {
        uri: "https://graph.facebook.com" + path,
        method: 'GET',
        headers: {
            'Authorization': 'OAuth ' + message.social.facebook.token
        }
    };

    request(options)
        .then((response) => {
            let data = message;

            data.response = {
                platform: "facebook",
                type: "media",
                data: JSON.parse(response)
            };

			context.log({'Data sent to the queue': data});
            context.bindings.out = data;
            context.done();
        })
        .catch((error) => {context.log(error); context.done(error);});
}