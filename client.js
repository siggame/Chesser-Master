// Client: a simple WS client wrapper "class"

function Client(id, ws, server, printIO) {
    this.id = id;
    this.ws = ws;
    this.server = server;

    var self = this;
    this.ws.onmessage = function(message) {
        if(self.server.printIO) {
            console.log("To {} <- {}".format(self, message.data));
        }

        var data;
        try {
            data = JSON.parse(message.data);
        }
        catch(err) {
            return self.disconnect("Malformed JSON.");
        }

        self.onMessage(data);
    };

    this.ws.onclose = function() {
        self.onClose();
    };

    this.ws.onerror = function(err) {
        console.log("error", err);
        this.disconnect();
    };
};

var requiredParameters = ["type", "name", "password"];
Client.prototype.onMessage = function(data) {
    this.registered = true;
    if(data.event === "register") {
        var registration = data.data;
        for(var i = 0; i < requiredParameters.length; i++) {
            var key = requiredParameters[i];

            if(!registration.hasOwnProperty(key)) {
                var str = "missing registration parameter {}".format(key);
                console.log("{} {}".format(this));
                return this.disconnect(str);
            }

            this[key] = registration[key];
        }

        this.playData = registration.playData; // arena client only

        this.server.clientRegistered(this);
    }
};

Client.prototype.onClose = function() {
    this.disconnect();

    if(this.bridgedClient) {
        delete this.bridgedClient.bridgedClient;
        this.bridgedClient.disconnect("Bridged client disconnected");
        delete this.bridgedClient;
    }
};

Client.prototype.send = function(eventName, data) {
    var str = JSON.stringify({
        event: eventName,
        data: data,
    });

    if(this.server.printIO) {
        console.log("From {} -> {}".format(this, str));
    }

    this.ws.send(str);
};

Client.prototype.disconnect = function(message) {
    if(!this._disconnected) {
        this._disconnected = true;
        if(message) {
            this.send("message", message);
        }

        this.ws.close();

        this.server.clientDisconnected(this);
    }
};

Client.prototype.toString = function() {
    return ("Client " + (this.registered ? "({type}) '{name}' " : "") + "#{id}").format(this);
};

module.exports = Client;
