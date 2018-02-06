// Function: Handles messages in the tofilter queue
//
// Attempts to find the user data associated with the message and if it exists, and all is valid,
// then send a message to the tostructure queue for processing.

module.exports = function (context, message) {
    
    let err = null;

	context.log({Message: message});

	// Execute the query contained in the database binding (function.json)
    var documents = context.bindings.documents;

	if (!documents || documents.length === 0) {
		err = 'No document data returned.';
		context.log.warn(err);
		context.done(err);
		return;
	}

    let userdata = documents[0];
    
    if (!userdata || userdata == undefined) {
		err = 'Not tracking user / couldn\'t find user.';
		context.log.warn(err);
		context.done(err);
		return;
    }

    if ((!userdata.twitter || userdata.twitter == undefined)
        && (!userdata.facebook || userdata.facebook == undefined)
        && (!userdata.instagram || userdata.instagram == undefined)) {
		err = 'The user has no social profiles.';
		context.log.warn(err);
		context.done(err);
		return;
    }

    if (!userdata.id) {
		err = 'The user has no id.';
		context.log.warn(err);
		context.done(err);
		return;
    }

	let newGuid = guid();
	context.log({RequestID: newGuid});
	context.log({UserData: userdata});

    context.bindings.out = {
        requestid: newGuid,
        user: userdata,
        request: message,
        triggeredOn: new Date()
    };

    context.done();

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
};