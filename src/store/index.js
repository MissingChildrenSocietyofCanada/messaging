// Function: Handles messages in the tostore queue
//
// Adds the current date/time when the data is being stored and sends back out to the database

module.exports = function (context, message) {

	context.log({Message: message});

    let data = message;

    data.store = {
        storedOn: new Date()
    };

    context.bindings.out = data;

    context.done();
};