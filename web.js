module.exports = function(wsServer) {
    var express = require('express');
    var expressHbs = require('express-handlebars');

    var app = express();

    // setup handlebars as the views
    app.engine('hbs', expressHbs({
        extname:'hbs',
    }));

    app.set('view engine', 'hbs');
    app.set('views', './');

    var port = 5480;
    var http = require('http').Server(app);
    var server = http.listen(port, function() {
        console.log('HTTP server running on port ' + port);
    });

    server.on("error", function(err) {
        console.log.error(err.code !== 'EADDRINUSE' ? err : "Webinterface cannot listen on port " + port + ". Address in use.");
    });

    app.get('/', function(req, res) {
        var clientTypes = [
            {
                type: "Playing",
                clients: [],
            },
            {
                type: "Arena",
                clients: [],
            },
            {
                type: "Chesser",
                clients: [],
            },
        ];

        for(var key in wsServer.arenaClients) {
            var client = wsServer.arenaClients[key];

            clientTypes[client.bridgedClient ? 0 : 1].clients.push(client.name);
        }

        var chesserClients = [];
        for(var key in wsServer.chesserClients) {
            var client = wsServer.chesserClients[key];

            if(!client.bridgedClient) {
                clientTypes[2].clients.push(client.name);
            }
        }

        for(var i = 0; i < clientTypes.length; i++) {
            clientTypes[i].clients.sort(function(a, b) {
                return a.localeCompare(b);
            });
        }

        res.render("index", {
            clientTypes,
        });
    });
};
