var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var config = {
    userName: 'mcscroot',
    password: 'mqRJAxoRd1lvlS1N1UVuhn220OzT0d',
    server: 'mcsc.database.windows.net',
    options: {
        database: 'social'
    }
}

module.exports = function (context, req) {

    var connection = new Connection(config);

    connection.on('connect', function (err) {
        if (err) {
            context.res = {
                status: 500,
                body: err
            }
        }
        else {
            /*
            request = new Request("SELECT * FROM [dbo].[vwProfiles]",
                function (err, rowCount, rows) {
                    if (err) {
                        context.res = {
                            status: 500,
                            body: err
                        }
                    }
                    else {
                        context.res = {
                            status: 200,
                            body: "WTF"//{ test: "test", count: rowCount, rows }
                        };
                    }s
                }
            ); */
            context.res = {
                status: 200,
                body: "WTF"//{ test: "test", count: rowCount, rows }
            }
        }
    });

    context.done();
}