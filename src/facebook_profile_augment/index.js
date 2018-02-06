var request = require('request-promise');

// Function: Handles messages in the toaugment topic, where the platform is 'facebook'
//
// Queries the Facebook Graph API for profile related information

module.exports = function (context, message) {

	context.log({Message: message});

    let path = '/' + message.social.facebook.id + '?fields=email,first_name,last_name,birthday,locale,location,picture.width(500),about,education,friends,hometown,photos,relationship_status,religion,political,tagged_places,work,posts';

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
                type: "profile",
                data: JSON.parse(response)
            };

			context.log({'Data sent to the queue': data});
			context.bindings.out = data;
			context.done();
        })
        .catch((error) => {context.log(error); context.done(error);});
}