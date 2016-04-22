var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({description: "Runs Chesser-Master with options."});
var parserArgs = [
    [["-p", "--port"], {action: "store", dest: "port", defaultValue: 5454, help: "the port that clients should connect through via WebSockets."}],
    [['--printIO'], {action: 'storeTrue', dest: 'printIO', help: '(debugging) print IO through the TCP socket to the terminal'}],
];

for(var i = 0; i < parserArgs.length; i++) {
    parser.addArgument.apply(parser, parserArgs[i]);
}

var args = parser.parseArgs();

module.exports = args;
