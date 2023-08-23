const videoContainer = document.querySelector("#videos");
var data = {
  userToken: "",
  roomName: "",
  roomId: "",
  roomToken: "",
  name: "",
  room: undefined,
  callClient: undefined,
  localTrack: undefined
};
const vm = new Vue({
  el: "#vue",
  data: data,
  computed: {
    roomUrl: function() {
      return `https://${location.hostname}?room=${this.roomId}`;
    }
  },
  async mounted() {
    api.setRestToken();
    localStorage.removeItem('name');
    localStorage.removeItem('roomId');
    localStorage.setItem('isJoin', "no");
    this.name = "";
    
    const urlParams = new URLSearchParams(location.search);
    const roomId = urlParams.get("room");
    if (roomId) {
      this.roomId = roomId;
      localStorage.setItem('roomId', roomId);
    }
  },
  methods: {
    authen: function() {
      return new Promise(async resolve => {
        const userId = `${(Math.random() * 100000).toFixed(6)}`;
        const userToken = await api.getUserToken(userId);
        this.userToken = userToken;

        if (!this.callClient) {
          const client = new StringeeClient();

          client.on("authen", function(res) {
            console.log("on authen: ", res);
            resolve(res);
          });
          this.callClient = client;
        }
        this.callClient.connect(userToken);
      });
    },
    publish: async function(screenSharing = false) {
      const localTrack = await StringeeVideo.createLocalVideoTrack(
        this.callClient,
        {
          audio: true,
          video: true,
          screen: screenSharing,
          videoDimensions: { width: 640, height: 360 }
        }
      );
      this.localTrack = localTrack;
      const videoElement = localTrack.attach();
      this.addVideo(videoElement);

      const roomData = await StringeeVideo.joinRoom(
        this.callClient,
        this.roomToken
      );
      const room = roomData.room;
      console.log({ roomData, room });

      if (!this.room) {
        this.room = room;
        room.clearAllOnMethos();
        room.on("addtrack", e => {
          const track = e.info.track;

          console.log("addtrack", track);
          if (track.serverId === localTrack.serverId) {
            console.log("local");
            return;
          }
          this.subscribe(track);
        });
        room.on("removetrack", e => {
          const track = e.track;
          if (!track) {
            return;
          }

          const mediaElements = track.detach();
          mediaElements.forEach(element => element.remove());
        });

        // Join existing tracks
        roomData.listTracksInfo.forEach(info => this.subscribe(info));
      }

      await room.publish(localTrack);
      console.log("room publish successful");
    },
    createRoom: async function() {
      const roomname = document.querySelector("#roomName");
      const username = document.querySelector("#txtname");
      if(username.value.trim() == null || username.value.trim() == undefined || username.value.trim() == "" || roomname.value.trim() == "") {
        alert("Vui lòng nhập thông tin phòng");
      } else {
        const room = await api.createRoom(roomname.value);
        const { roomId } = room;
        const roomToken = await api.getRoomToken(roomId);

        this.roomId = roomId;
        this.roomToken = roomToken;
        console.log({ roomId, roomToken });
        this.name = username.value;
        localStorage.setItem('name', username.value);
        localStorage.setItem('roomId', roomId);
        await this.authen();
        await this.publish();
      }
    },
    join: async function() {
      const roomToken = await api.getRoomToken(this.roomId);
      this.roomToken = roomToken;

      await this.authen();
      await this.publish();
    },
    joinWithId: async function() {
      
      const username = document.querySelector("#txtname3");
      const id = document.querySelector("#txtid");
      if((username.value.trim() == "" && id.value.trim() == "") || 
         (username.value.trim() != "" && id.value.trim() == "") || 
         (username.value.trim() == "" && id.value.trim() != "")) {
        alert("Vui lòng nhập ID phòng và username");
      } else {
        this.roomId = id.value;
        localStorage.setItem('roomId', id.value);
        this.name = username.value;
        localStorage.setItem('name', username.value);
        await this.join();
      }
    },
    joinWithName: async function() {
      const username = document.querySelector("#txtname2");
      if(username.value.trim() == null || username.value.trim() == undefined || username.value.trim() == "") {
        alert("Vui lòng nhập tên");
      } else {
        this.name = username.value;
        localStorage.setItem('name', username.value);
        await this.join();
      }
    },
    subscribe: async function(trackInfo) {
      const track = await this.room.subscribe(trackInfo.serverId);
      track.on("ready", () => {
        const videoElement = track.attach();
        this.addVideo(videoElement);
      });
    },
    addVideo: function(video) {
      video.removeAttribute("controls");
      video.setAttribute("playsinline", "true");
      video.setAttribute("style", "border-radius: 5px;");
      video.setAttribute("class", "col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6");
      video.setAttribute("id", "video");
      videoContainer.appendChild(video);
    }
  }
});
const vm2 = new Vue({
  el: "#vue2",
  data: data,
  methods: {
    authen: function() {
      return new Promise(async resolve => {
        const userId = `${(Math.random() * 100000).toFixed(6)}`;
        const userToken = await api.getUserToken(userId);
        this.userToken = userToken;

        if (!this.callClient) {
          const client = new StringeeClient();

          client.on("authen", function(res) {
            console.log("on authen: ", res);
            resolve(res);
          });
          this.callClient = client;
        }
        this.callClient.connect(userToken);
      });
    },
    publishscreen: async function() {
      const localTrack = await StringeeVideo.createLocalVideoTrack(
        this.callClient,
        {
          video: true,
          screen: true,
          videoDimensions: { width: 640, height: 360 }
        }
      );

      const videoElement = localTrack.attach();
      // this.addVideo(videoElement);

      const roomData = await StringeeVideo.joinRoom(
        this.callClient,
        this.roomToken
      );
      const room = roomData.room;
      console.log({ roomData, room });

      if (!this.room) {
        this.room = room;
        room.clearAllOnMethos();
        room.on("addtrack", e => {
          const track = e.info.track;

          console.log("addtrack", track);
          if (track.serverId === localTrack.serverId) {
            console.log("local");
            return;
          }
          this.subscribe(track);
        });
        room.on("removetrack", e => {
          const track = e.track;
          if (!track) {
            return;
          }
          const mediaElements = track.detach();
          mediaElements.forEach(element => element.remove());
        });

        // Join existing tracks
        roomData.listTracksInfo.forEach(info => this.subscribe(info));
      }

      await room.publish(localTrack);
      console.log("room publish successful");
    },
    createRoom: async function() {
      const room = await api.createRoom();
      const { roomId } = room;
      const roomToken = await api.getRoomToken(roomId);

      this.roomId = roomId;
      this.roomToken = roomToken;
      console.log({ roomId, roomToken });

      await this.authen();
      await this.publish();
    },
    join: async function() {
      const roomToken = await api.getRoomToken(this.roomId);
      this.roomToken = roomToken;

      await this.authen();
      await this.publish();
    },
    joinWithId: async function() {
      const roomId = prompt("Dán Room ID vào đây nhé!");
      if (roomId) {
        this.roomId = roomId;
        await this.join();
      }
    },
    subscribe: async function(trackInfo) {
      const track = await this.room.subscribe(trackInfo.serverId);
      track.on("ready", () => {
        const videoElement = track.attach();
        this.addVideo(videoElement);
      });
    },
    addVideo: function(video) {
      video.setAttribute("controls", "false");
      video.setAttribute("playsinline", "true");
      videoContainer.appendChild(video);
    },
    disconnect: async function() {
      if (!this.callClient) {
        return;
      }
      this.localTrack = undefined;
      this.room.leave(true);
      this.callClient.disconnect();
      window.location = "https://video-call-webrtc-test.glitch.me/";
    },
    disableVideo: async function() {
      console.log(this.localTrack);
      if (this.localTrack.screen) {
        return;
      }

      console.log(
        "hien tai track.localVideoEnabled=" + this.localTrack.localVideoEnabled
      );

      if (this.localTrack.localVideoEnabled) {
        //disable
        var cam = document.getElementById("cam");
        cam.name = "videocam-off-outline";
        cam.style.background = "#484848";
        this.localTrack.enableLocalVideo(false);
      } else {
        //enable
        var cam = document.getElementById("cam");
        cam.name = "videocam-outline";
        cam.style.background = "#f02645";
        this.localTrack.enableLocalVideo(true);
      }
    },
    disableAudio: async function(e) {
      if (this.localTrack.muted) {
        //unmute
        console.log("unmute");
        var mic = document.getElementById("mic");
        mic.name = "mic-outline";
        mic.style.background = "#f02645";
        this.localTrack.mute(false);
      } else {
        //mute
        var mic = document.getElementById("mic");
        mic.name = "mic-off-outline";
        mic.style.background = "#484848";
        console.log("mute");
        this.localTrack.mute(true);
      }
    }
  }
});

const vm3 = new Vue({
  el: "#vuename",
  data: data
});

const vm4 = new Vue({
  el: "#vue4",
  data: data
});

const vm5 = new Vue({
  el: "#vue5",
  data: data
});

const vm6 = new Vue({
  el: "#vue6",
  data: data
});

//time
setInterval(() => {
  var time = document.querySelector("#time");
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let day_night = "AM";

  if (hours > 12) {
    day_night = "PM";
    hours = hours - 12;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  time.textContent = hours + ":" + minutes + ":" + seconds + " " + day_night;
});

setInterval(function() {
  openCalendar();
  openVideoCam();
}, 100);

function openCalendar() {
  var calender = document.getElementById("calendar");
  calender.onclick = function() {
    document.getElementById("videocam").style.color = "#fff";
    document.getElementById("calendar").classList.add("checked");
    document.getElementById("calendar").style.color = "green";
    document.getElementById("date-meet").style.display = "grid";
    document.getElementById("centee").style.display = "none";
  };
}

function openVideoCam() {
  var videocam = document.getElementById("videocam");
  videocam.onclick = function() {
    document.getElementById("calendar").style.color = "#fff";
    document.getElementById("videocam").classList.add("checked");
    document.getElementById("videocam").style.color = "green";
    document.getElementById("centee").style.display = "block";
    document.getElementById("date-meet").style.display = "none";
  };
}
/* */
// weather
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");

// App data
const weather = {};

weather.temperature = {
  unit: "celsius"
};

// APP CONSTS AND VARS
const KELVIN = 273;
// API KEY
const key = "9311757892b532bd58c6ee9e0413ff22";

// CHECK IF BROWSER SUPPORTS GEOLOCATION
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = "<p>Browser doesn't Support Geolocation</p>";
}

// SET USER'S POSITION
function setPosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;

  getWeather(latitude, longitude);
}

// SHOW ERROR WHEN THERE IS AN ISSUE WITH GEOLOCATION SERVICE
function showError(error) {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = `<p> ${error.message} </p>`;
}

// GET WEATHER FROM API PROVIDER
function getWeather(latitude, longitude) {
  let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
  fetch(api)
    .then(function(response) {
      let data = response.json();
      return data;
    })
    .then(function(data) {
      weather.temperature.value = Math.floor(data.main.temp - KELVIN);
      weather.description = data.weather[0].description;
      weather.iconId = data.weather[0].icon;
      weather.city = data.name;
      weather.country = data.sys.country;
    })
    .then(function() {
      displayWeather();
    });
}

// DISPLAY WEATHER TO UI
function displayWeather() {
  iconElement.innerHTML = `<img src="https://cdn.glitch.me/e6ac1964-cb22-4f02-ac54-f51284109858%2F${weather.iconId}.png?v=1636790841254"/>`;
  tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
  descElement.innerHTML = weather.description;
  locationElement.innerHTML = `${weather.city}, ${weather.country}`;
}

// C to F conversion
function celsiusToFahrenheit(temperature) {
  return (temperature * 9) / 5 + 32;
}

// WHEN THE USER CLICKS ON THE TEMPERATURE ELEMENET
tempElement.addEventListener("click", function() {
  if (weather.temperature.value === undefined) return;

  if (weather.temperature.unit == "celsius") {
    let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
    fahrenheit = Math.floor(fahrenheit);

    tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
    weather.temperature.unit = "fahrenheit";
  } else {
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    weather.temperature.unit = "celsius";
  }
});

//
const inputBox = document.querySelector(".inputField input");
const addBtn = document.querySelector(".inputField button");
const todoList = document.querySelector(".todoList");
const deleteAllBtn = document.querySelector(".footer button");
// onkeyup event
inputBox.onkeyup = () => {
  let userEnteredValue = inputBox.value; //getting user entered value
  if (userEnteredValue.trim() != 0) {
    //if the user value isn't only spaces
    addBtn.classList.add("active"); //active the add button
  } else {
    addBtn.classList.remove("active"); //unactive the add button
  }
};
showTasks(); //calling showTask function
addBtn.onclick = () => {
  //when user click on plus icon button
  let userEnteredValue = inputBox.value; //getting input field value
  let getLocalStorageData = localStorage.getItem("New Todo"); //getting localstorage
  if (getLocalStorageData == null) {
    //if localstorage has no data
    listArray = []; //create a blank array
  } else {
    listArray = JSON.parse(getLocalStorageData); //transforming json string into a js object
  }
  listArray.push(userEnteredValue); //pushing or adding new value in array
  localStorage.setItem("New Todo", JSON.stringify(listArray)); //transforming js object into a json string
  showTasks(); //calling showTask function
  addBtn.classList.remove("active"); //unactive the add button once the task added
};

function showTasks() {
  let getLocalStorageData = localStorage.getItem("New Todo");
  if (getLocalStorageData == null) {
    listArray = [];
  } else {
    listArray = JSON.parse(getLocalStorageData);
  }
  const pendingTasksNumb = document.querySelector(".pendingTasks");
  pendingTasksNumb.textContent = listArray.length; //passing the array length in pendingtask
  if (listArray.length > 0) {
    //if array length is greater than 0
    deleteAllBtn.classList.add("active"); //active the delete button
  } else {
    deleteAllBtn.classList.remove("active"); //unactive the delete button
  }
  let newLiTag = "";
  listArray.forEach((element, index) => {
    newLiTag += `<li>${element}<span class="icon" onclick="deleteTask(${index})"><ion-icon name="trash-outline"></ion-icon></span></li>`;
  });
  todoList.innerHTML = newLiTag; //adding new li tag inside ul tag
  inputBox.value = ""; //once task added leave the input field blank
}
// delete task function
function deleteTask(index) {
  let getLocalStorageData = localStorage.getItem("New Todo");
  listArray = JSON.parse(getLocalStorageData);
  listArray.splice(index, 1); //delete or remove the li
  localStorage.setItem("New Todo", JSON.stringify(listArray));
  showTasks(); //call the showTasks function
}
// delete all tasks function
deleteAllBtn.onclick = () => {
  listArray = []; //empty the array
  localStorage.setItem("New Todo", JSON.stringify(listArray)); //set the item in localstorage
  showTasks(); //call the showTasks function
};
StringeeVideo.getDevicesInfo().then(function(data) {
  console.log(
    "StringeeVideo.getDevicesInfo()..., thu lay thong tin ve thiet bi"
  );
  renderDevicesInfo(data);
});
var selectedCameraId = null;
var selectedMicrophoneId = null;
var selectedSpeakerId = null;
function renderDevicesInfo(data) {
  //neu User chua cap quyen thi ham nay tra ve da rong~
  selectedCameraId = localStorage.getItem("selectedCameraId");
  selectedMicrophoneId = localStorage.getItem("selectedMicrophoneId");
  selectedSpeakerId = localStorage.getItem("selectedSpeakerId");

  console.log(
    "local storage: selectedMicrophoneId=====" + selectedMicrophoneId
  );

  $("#listCameras").html("");
  $("#listMicrophones").html("");
  $("#listSpeakers").html("");

  var selectedCameraOk;
  var selectedMicOk;
  var selectedSpeakerOk;

  data.cameras.forEach((camera, index) => {
    var option = $("<option>")
      .val(camera.deviceId)
      .text(camera.label);
    if (selectedCameraId && selectedCameraId === camera.deviceId) {
      option.attr("selected", "selected");
      selectedCameraOk = true;
    }

    $("#listCameras").append(option);
  });
  data.microphones.forEach((mic, index) => {
    var option = $("<option>")
      .val(mic.deviceId)
      .text(mic.label);
    if (selectedMicrophoneId && selectedMicrophoneId === mic.deviceId) {
      option.attr("selected", "selected");
      selectedMicOk = true;
    }

    $("#listMicrophones").append(option); //deviceId
  });
  data.speakers.forEach((speaker, index) => {
    var option = $("<option>")
      .val(speaker.deviceId)
      .text(speaker.label);
    if (selectedSpeakerId && selectedSpeakerId === speaker.deviceId) {
      option.attr("selected", "selected");
      selectedSpeakerOk = true;
    }

    $("#listSpeakers").append(option); //deviceId
  });

  if (selectedCameraId && !selectedCameraOk) {
    localStorage.removeItem("selectedCameraId");
    selectedCameraId = null;
  }
  if (selectedMicrophoneId && !selectedMicOk) {
    localStorage.removeItem("selectedMicrophoneId");
    selectedMicrophoneId = null;
  }
  if (selectedSpeakerId && !selectedSpeakerOk) {
    localStorage.removeItem("selectedSpeakerId");
    selectedSpeakerId = null;
  }
}
