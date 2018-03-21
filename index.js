const express = require('express');
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 5000;


app.use(express.static(__dirname + '/public'));

var users = [];
var msgs = [];
var allRooms = {};
var allstickers = {};
var allplayers ={};



io.on("connection", function(socket){
	
    console.log("Connection established");
	
    socket.on("adventurername", function(data){
        console.log("Hail and well met, "+ data + "!");
        users.push(data);
        
        io.emit("userList", users);
    });
    
    socket.on("sendChat", function(data){
        console.log("A message has been sent to the server.");
        msgs.push(data);
        
        console.log(msgs)
        io.emit("msgSent", msgs);
        
    });
    
	
	socket.on("joinroom",function(data){
		socket.emit("yourid",socket.id);
		socket.join(data);
		//io.emit("createimage",allusers);
		socket.myRoom = data;
		
		if(!allRooms[data]){
			allRooms[data] = [];
			allstickers[data] = [];
		}
		
		allRooms[data].push(socket.id);
		io.to(data).emit("createimage",allRooms[data]);
		
		console.log(data);
	});
	
	socket.on("mymove", function(data){
		socket.to(this.myRoom).emit("usermove", data);
	});
	socket.on("sticker", function(data){
		allstickers[this.myRoom].push(data);
		io.to(this.myRoom).emit("newsticker",allstickers[this.myRoom]);
	});
	
	socket.on("joinpoll",function(data){
		socket.join(data);
		socket.myRoom = data;
		
		if(!allplayers[data]){
			allplayers[data] = {
				users:[],
				q:{}
			}
		}
		
		console.log(data);
	});
	
	socket.on("qsubmit",function(data){
		//tell everyon there is a new q'
		console.log(data);
		allplayers[socket.myRoom].q =data;
		socket.to(socket.myRoom).emit("newq",data);
	});
	
	socket.on("answer",function(data){
		var msg = "Wroooong!"
		if(allplayers[socket.myRoom].q.a==data){
			msg= "You got it!"
		}
		socket.emit("result",msg)
	});
	
	
	socket.on("disconnect",function(){
		var index = allRooms[this.myRoom].indexOf(socket.id); 	
		allRooms[this.myRoom].splice(index,1);
		io.to(this.myRoom).emit("createimage",allRooms[this.myRoom]);
	})
    
});

server.listen(port, (err)=>{
    if(err){
        console.log("Error: "+err);
        return false;
    }
    console.log("The socket port has been opened, adventurer!")
})