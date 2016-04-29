// Server: a simple WebSocket server wrapper "class"

var Client = require("./client");
var WebSocketServer = require("ws").Server

function Server(port, printIO) {
    this.unregistredClients = {}; // indexed by client.id
    this.chesserClients = {}; // indexed by player name
    this.arenaClients = {}; // same as ^
    this._nextClientID = 0;
    this.printIO = printIO;

    this.wss = new WebSocketServer({
        port: port,
    });

    console.log("WebSocket server listening on port " + port);

    var self = this;
    this.wss.on("connection", function connection(ws) {
        var id = self._nextClientID++;
        var client = new Client(id, ws, self);
        self.unregistredClients[id] = client;
        console.log(client.toString() + " connected");
    });
};

Server.prototype.clientRegistered = function(client) {
    delete this.unregistredClients[client.id];

    if(client.type.toLowerCase() === "chesser") {
        this.chesserClients[client.name] = client;
    }
    else { // should be an arena client
        this.arenaClients[client.name] = client;
    }

    console.log(client.toString() + " registered with password: {password}".format(client));

    var chesserClient = this.chesserClients[client.name];
    var arenaClient = this.arenaClients[client.name]
    if(chesserClient && arenaClient) {
        this.bridge(chesserClient, arenaClient);
    }
};

Server.prototype.bridge = function(chesserClient, arenaClient) {
    if(chesserClient.password !== arenaClient.password) {
        console.log("{} using invalid password ({})".format(chesserClient, arenaClient.password));
        chesserClient.disconnect("Incorrect Password!");
        return;
    }

    console.log("{} connection bridged!".format(chesserClient));

    chesserClient.bridgedClient = arenaClient;
    arenaClient.bridgedClient = chesserClient;

    // the password is valid, so tell Chesser to play the arena game
    chesserClient.send("play", arenaClient.playData);
    arenaClient.send("bridged");
};

Server.prototype.clientDisconnected = function(client) {
    var lists = ["unregistredClients", "chesserClients", "arenaClients"];
    for(var i = 0; i < lists.length; i++) {
        var key = lists[i];
        var list = this[key];
        if(list[client.name] === client) {
            delete list[client.name];
        }
    }

    console.log(String(client) + " disconnected ")
};

Server.prototype.clientDone = function(client) {

};

module.exports = Server;
