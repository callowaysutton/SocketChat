// Connect to the websocket server
var socket = io.connect();

$(document).ready(function() {
    var chatApp = new Chat(socket);

    socket.on("nameResult", function(result) {
        var message;

        if (result.success) {
            message = "You are now known as " + result.name;
        } else {
            message = result.message;
        }

        $("#messageArea").append(divSystemContentElement(message));
    });

    socket.on("joinResult", function(result) {
        $("#chatRoom").text(result.room);
        $("messageArea").append(divSystemContentElement("Room changed..."));
    });

    socket.on("message", function(message) {
        var newElement = $("<div></div>").text(message.text);
        $("#messageArea").append(newElement);
    });

    socket.on("rooms", function(rooms) {
        $("#roomList").empty();

        for(var room in rooms) {
            room = room.substring(1, room.length);
            if (room != "") {
                $("#roomList").append(divEscapedContentElement(room));
            }
        }

        $("#roomList div").click(function() {
            chatApp.processCommand("/join " + $(this).text());
        });
    });

    setInterval(function() {
        socket.emit("rooms");
    }, 1000);

    $("sendMessage").focus();

    $("sendForm").submit(function() {
        processUserInput(chatApp, socket);
        return false;
    });
});


// Helper functions
function divEscapedContentElement(message) {
    return $("<div></div>".text(message));
}

function divSystemContentElement(message) {
    return $("<div></div>").html("<i>" + message + "</i>");
}

function processUserInput(chatApp, socket) {
    var message = $("#sendMessage").val();
    var systemMessage;

    if(message.charAt(0) == "/") {
        systemMessage = chatApp.processCommand(message);
        if(systemMessage) {
            $("messageArea").append(divSystemContentElement(systemMessage));
        }
    } else {
        chatApp.sendMessage($("chatRoom").text(), message);
        $("#messageArea").append(divEscapedContentElement(systemMessage));
        $("#messageArea").scrollTop($("messageArea").prop("scrollHeight"));
    }
    $("sendMessage").val("");
}