var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.listen(3000,function () {
  console.log("Server started: 3000");
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get("/", function (request,response) {
  response.render("index");
});





var chatData=[];
var interval;
var users=[];
var connectedUsers=[];

app.post('/checkChatData', function(request,response){
  if(users.indexOf(request.body.user)>=0){
    connectedUsers.push(request.body.user);
    response.send({users:users,chatData:chatData});
  }
});

app.post('/sendChatData', function(request,response){
  console.log(request.body);
  if(request.body.name){
    chatData.push(request.body);
  } else {
    chatData.push({chat:request.body.chat+"<br> Total "+users.length+" usuarios en el chat",time:new Date()});
  }
  response.send(chatData);
});

app.get('/users', function(request,response){
  response.send(users);
});

app.post('/users', function(request,response){
  if(users.length<=0){
    interval=setInterval(checkCurrentUsers,5000);
    console.log("Server Interval On");
  }
  users.push(request.body.user);
  response.send(users);
  console.log("[CURRENT USERS] : ",users);
});

function checkCurrentUsers() {
  NumOfUsers=users.length;
  users.forEach(function(user,i,a){
   if(connectedUsers.indexOf(user)<0) {
     NumOfUsers--;
     chatData.push({chat:"[ "+a[i]+" ] se ha ido.<br> Total "+NumOfUsers+" usuarios en el chat",time:new Date()});
     a[i]=0;
     console.log("[CURRENT USERS] : ",users);
   }
  });
  users=users.filter(function (user) { return user !==0; });
  connectedUsers=[];
  if(users.length<=0){
    clearInterval(interval);
    console.log("Server Interval Off");
  }
}
