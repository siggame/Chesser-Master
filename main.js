process.title = "Chesser-Master";

require('string-format').extend(String.prototype);
var args = require("./args");
var Server = require("./server");

var server = new Server(args.port, args.printIO);

var web = require("./web")(server);
