// Import libraries
var http = require("http");
var fs = require("fs");
var mime = require("mime");
var path = require("path");

// Declare variables
var serverPort = 3000
var cache = {};

// Start server
var server = http.createServer(function(request, response) {
    var filePath = false;

    if (request.url == "/") {
        filePath = "public/index.html";
    } else {
        filePath = "public" + request.url;
    }
    var absPath = "./" + filePath;
    serveStatic(response, cache, absPath);
});

server.listen(serverPort, function() {
    console.log("Server listening on port " + serverPort)
})

// Serve static files
function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
}

function send404(response) {
    response.writeHead(404, {
        "Content-Type": "text/plain"
    });
    response.write("Error 404: Couldn't find the resource");
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(200,
        {
            "Content-Type": mime.getType(path.basename(filePath))
        });
        response.end(fileContents);
}