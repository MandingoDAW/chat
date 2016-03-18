
$(function(){
  
  var ip = location.host;
  var localChatData = [];
  var interval;
  var users;

  //name check & enter the chat
  $('#chatStart').on("click",function (event) {
    event.preventDefault();
    var userName=$('#name').val().trim();
    if(userName.length>2 && userName.length<13){
      $.ajax({
        method:"get",
        url: "http://"+ip+"/users",
        success: function(data){
          if(data.indexOf(userName)<0){
            $.ajax({
              method:"post",
              contentType: 'application/json; charset=UTF-8',
              dataType   : 'json',
              data: JSON.stringify({user:userName}),
              url: "http://"+ip+"/users",
              success: function(data){
                $('#hiddenName').val(userName);
                $('.signIn').css('display','none');
                $('.chatDiv').slideDown();
                $('.formDiv').slideDown();
                interval = setInterval(getChatData,1000);
                $.ajax({
                  method:"post",
                  contentType: 'application/json; charset=UTF-8',
                  dataType   : 'json',
                  data: JSON.stringify({chat:"[ "+userName+" ] ha entrado"}),
                  url: "http://"+ip+"/sendChatData",
                  success: function(data){
                    $("input[name='chat']").val("").focus();
                    getChatData();
                  },
                });
              },
            });
          } else {
            alert("Pon otro nombre, este está escogido ya");
          }
        },
      });
    } else {
      alert("El nombre deberia tener entre 4 y 12 caracteres");
    }
  });

  //getting chat data from server & sending user's connection info to server per second
  var chatTable = $('.chatTable');
  function getChatData(){
    $.ajax({
      method:"post",
      timeout:"1000",
      contentType: 'application/json; charset=UTF-8',
      dataType   : 'json',
      data: JSON.stringify({user:$('#hiddenName').val()}),
      url: "http://"+ip+"/checkChatData",
      success: function(data){
        users=data.users;
        if(localChatData.length<data.chatData.length){
          for(i=localChatData.length;i<data.chatData.length;i++){
            if(data.chatData[i].name){
              chatTable.append("<tr><td class='name' style='background-color:"+data.chatData[i].color+"; color:white'>"+data.chatData[i].name+"</td><td class='chat'style='color:"+data.chatData[i].color+"'>"+data.chatData[i].chat+"</td></tr>");
            } else {
              var localTime=new Date(data.chatData[i].time);
              chatTable.append("<tr><td class='name'>SYSTEM</td><td class='chat'>"+data.chatData[i].chat+" ("+localTime.toLocaleTimeString()+")</td></tr>");
            }
          }
          localChatData=data.chatData;
          $(".chatDiv").scrollTop($(".chatDiv")[0].scrollHeight);
        }
      },
      error:function (err) {
        chatTable.append("<tr><td class='name' style='background-color:black'></td><td class='chat' style='background-color:black;color:white'>Disconnected!</td></tr>");
        clearInterval(interval);
        chatForm.off("submit");
        chatForm.on("submit",function (event) {
          event.preventDefault();
        });
        $(".chatDiv").scrollTop($(".chatDiv")[0].scrollHeight);
      }
    });
  }

  //sending chat data to server on submit
  var chatForm = $('#chatForm');
  chatForm.on("submit", function(event){
    event.preventDefault();
    if(event.target.chat.value == 0){
      alert("Please type message");
    } else {
      $.ajax({
        method:"post",
        contentType: 'application/json; charset=UTF-8',
        dataType   : 'json',
        data: JSON.stringify({name:event.target.name.value,color:event.target.color.value,chat:event.target.chat.value}),
        url: "http://"+ip+"/sendChatData",
        success: function(data){
          $("input[name='chat']").val("").focus();
          getChatData();
        },
      });
    }
  });

  //show current users
  $('#hiddenName').on('mousedown',function(event){
    event.preventDefault();
    alert("[Current Users] : "+users);
    $("input[name='chat']").focus();
  });
});
