const socket = io("https://stream3012.herokuapp.com/");

var myname;
var txtarea = document.getElementById("txtarea");
socket.on("mess", messArr => {
  console.log(messArr);
  messArr.forEach(info => {
    const { ten, msg, roomId } = info;

    var div = document.createElement("div");
    var timediv = document.createElement("span");
    var time = document.createTextNode(getTime());
    var para = document.createElement("h6");
    var msgdiv = document.createElement("h7"); // Create a <p> node
    para.style.color = "white";
    para.style.fontWeight = "bold";
    msgdiv.style.color = "white";
    timediv.style.marginLeft = "30px";
    timediv.style.color = "grey";
    timediv.style.fontStyle = "italic";
    timediv.style.fontSize = "12px";
    timediv.style.fontWeight = "400";
    var t = document.createTextNode(ten);
    var msgnode = document.createTextNode(msg);
    timediv.appendChild(time);
    div.style.marginBottom = "30px";
    div.appendChild(para);
    div.appendChild(msgdiv); // Create a text node
    msgdiv.appendChild(msgnode);
    para.appendChild(t);
    para.appendChild(timediv); // Append the text to <p>
    txtarea.appendChild(div);
  });
});
var c = document.getElementById("sendbtn");
var txtmsg = document.getElementById("txtmsg");
c.onclick = function() {
  if (
    txtmsg.value.trim() == null ||
    txtmsg.value.trim() == undefined ||
    txtmsg.value.trim() == ""
  ) {
    return;
  } else {
    event.preventDefault();
    var msg = txtmsg.value;
    // socket.emit('msg', msg);

    socket.emit("msg", {
      ten: myname,
      msg: msg
    });

    txtmsg.value = "";
    var div = document.createElement("div");
    var timediv = document.createElement("span");
    var time = document.createTextNode(getTime());
    var para = document.createElement("h6");
    var msgdiv = document.createElement("h7"); // Create a <p> node
    para.style.color = "white";
    para.style.fontWeight = "bold";
    msgdiv.style.color = "white";
    timediv.style.marginLeft = "30px";
    timediv.style.color = "grey";
    timediv.style.fontStyle = "italic";
    timediv.style.fontSize = "12px";
    timediv.style.fontWeight = "400";
    var t = document.createTextNode(myname);
    var msgnode = document.createTextNode(msg);
    timediv.appendChild(time);
    div.style.marginBottom = "30px";
    div.appendChild(para);
    div.appendChild(msgdiv); // Create a text node
    msgdiv.appendChild(msgnode);
    para.appendChild(t);
    para.appendChild(timediv); // Append the text to <p>
    txtarea.appendChild(div);
  }
};

txtmsg.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
      if (
        txtmsg.value.trim() == null ||
        txtmsg.value.trim() == undefined ||
        txtmsg.value.trim() == ""
      ) {
        return;
      } else {
        event.preventDefault();
        var msg = txtmsg.value;
        var roomId = localStorage.getItem("roomId");
        // socket.emit('msg', msg);

        socket.emit("msg", {
          roomId: roomId,
          ten: myname,
          msg: msg
        });

        txtmsg.value = "";
        var div = document.createElement("div");
        var timediv = document.createElement("span");
        var time = document.createTextNode(getTime());
        var para = document.createElement("h6");
        var msgdiv = document.createElement("h7"); // Create a <p> node
        para.style.color = "white";
        para.style.fontWeight = "bold";
        msgdiv.style.color = "white";
        timediv.style.marginLeft = "30px";
        timediv.style.color = "grey";
        timediv.style.fontStyle = "italic";
        timediv.style.fontSize = "12px";
        timediv.style.fontWeight = "400";
        var t = document.createTextNode(myname);
        var msgnode = document.createTextNode(msg);
        timediv.appendChild(time);
        div.style.marginBottom = "30px";
        div.appendChild(para);
        div.appendChild(msgdiv); // Create a text node
        msgdiv.appendChild(msgnode);
        para.appendChild(t);
        para.appendChild(timediv); // Append the text to <p>
        txtarea.appendChild(div);
      }
  }
});

setInterval(function() {
  var isJoin = localStorage.getItem("isJoin");
  const roomId = localStorage.getItem("roomId");
  var name = localStorage.getItem("name");
  if (isJoin == "no") {
    if (name != null) {
      socket.emit("join",roomId);
      localStorage.setItem("isJoin", "yes");
    }
  } else {
    return;
  }
}, 1000);

function getname() {
  var name = localStorage.getItem("name");
  if (name != undefined || name != "" || name != null) {
    myname = capitalizeFirstLetter(name);
  }
}
setInterval(getname, 100);
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function getTime() {
  var currentdate = new Date();
  var time = currentdate.getHours() + ":" + currentdate.getMinutes();
  return time;
}

var localvideotag = document.getElementById("localvideo");
function openStream() {
  const config = {
    audio: true,
    video: true
  };
  return navigator.mediaDevices.getUserMedia(config);
}
function playStream(idVideoTag, stream) {
  const video = document.getElementById(idVideoTag);
  video.srcObject = stream;
  video.play();
}
openStream().then(stream => {
  playStream("localvideo", stream);
});

// function logTime(){
//   //check if div is scrolled to the bottom
//   var atBottom = isElementScrolledToBottom(txtarea);
//   //if div was at the bottom, scroll to bottom again.
//   if(atBottom) {
//     scrollToBottom(txtarea);
//   }
// };

// //function to check if element is scrolled to the bottom
// function isElementScrolledToBottom(el) {
//   if (el.scrollTop >= (el.scrollHeight - el.offsetHeight)) {
//       return true;
//   }
//   return false;
// }

// //function to scroll to bottom
// function scrollToBottom(el) {
//   el.scrollTop = el.scrollHeight;
// }
