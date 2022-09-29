const audioPlayer = document.querySelector("#player");
const playBtn = audioPlayer.querySelector(".play-btn");
const progress = audioPlayer.querySelector(".progress");
const sliders = audioPlayer.querySelectorAll(".slider");
const player = audioPlayer.querySelector("audio");
const currentTime = audioPlayer.querySelector("#current-time");
const totalTime = audioPlayer.querySelector("#total-time");

const previousBtn = audioPlayer.querySelector(".previous-btn");
const nextBtn = audioPlayer.querySelector(".next-btn");

const randomIcon = audioPlayer.querySelector("#random-icon");
const refreshIcon = audioPlayer.querySelector("#refresh-icon");
const bluetoothIcon = audioPlayer.querySelector("#bluetooth-icon");
const heartIcon = audioPlayer.querySelector("#heart-icon");

const tracksContainer = audioPlayer.querySelector("#songs");

const draggableClasses = ["pin"];
let currentlyDragged = null;
let currentTrack = 0;

const songs = [
  {
    title: "rockstar",
    artist: "Post Malone, 21 Savage",
    cover:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/308622/rockstar-album-cover.jpg",
    audioFile:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/308622/Post%20Malone%20-%20rockstar%20ft.%2021%20Savage%20(1).mp3",
    color: "#c3af50",
  },
  {
    title: "Let You Down",
    artist: "NF",
    cover:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/308622/perception-album-cover.png",
    audioFile:
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/308622/NF%20-%20Let%20You%20Down.mp3",
    color: "#25323b",
  },
];

songs.map((song, i) => renderSongs(song, i));

window.addEventListener("mousedown", function (event) {
  if (!isDraggable(event.target)) return false;

  currentlyDragged = event.target;
  let handleMethod = currentlyDragged.dataset.method;

  this.addEventListener("mousemove", window[handleMethod], false);

  window.addEventListener(
    "mouseup",
    () => {
      currentlyDragged = false;
      window.removeEventListener("mousemove", window[handleMethod], false);
    },
    false
  );
});

playBtn.addEventListener("click", togglePlay);
player.addEventListener("timeupdate", updateProgress);
player.addEventListener("loadedmetadata", () => {
  totalTime.textContent = formatTime(player.duration);
});

previousBtn.addEventListener("click", handlePrevious);
nextBtn.addEventListener("click", handleNext);

randomIcon.addEventListener("click", () => {
  handleActiveClass(randomIcon, "random");
  refreshIcon.classList.remove("active");
  bluetoothIcon.classList.remove("active");
  heartIcon.classList.remove("active");
});

refreshIcon.addEventListener("click", () => {
  handleActiveClass(refreshIcon, "refresh");
  randomIcon.classList.remove("active");
  bluetoothIcon.classList.remove("active");
  heartIcon.classList.remove("active");
  togglePlay();
});

bluetoothIcon.addEventListener("click", () => {
  handleActiveClass(bluetoothIcon, "bluetooth");
  randomIcon.classList.remove("active");
  heartIcon.classList.remove("active");
  refreshIcon.classList.remove("active");
});

heartIcon.addEventListener("click", () => {
  handleActiveClass(heartIcon, "heart");
  if (heartIcon.classList.contains("active")) {
    heartIcon.classList.remove("fa-heart-o");
    heartIcon.classList.add("fa-heart");
  } else {
    heartIcon.classList.remove("fa-heart");
    heartIcon.classList.add("fa-heart-o");
  }
  randomIcon.classList.remove("active");
  bluetoothIcon.classList.remove("active");
  refreshIcon.classList.remove("active");
});

player.addEventListener("ended", function () {
  player.currentTime = 0;

  if (refreshIcon.classList.contains("active")) {
    togglePlay();
  } else {
    if (randomIcon.classList.contains("active")) {
      const songs = document.querySelector("#songs li").length - 1;
      const randomSong = Math.floor(Math.random() * songs) + 1;
      if (currentTrack === songs.length) return;
      handleChange(currentTrack + randomSong);
    } else {
      if (currentTrack === songs.length) {
        return;
      }
      handleChange(currentTrack + 1);
    }
    togglePlay();
  }
});

sliders.forEach((slider) => {
  const pin = slider.querySelector(".pin");
  slider.addEventListener("click", window[pin.dataset.method]);
});

function isDraggable(el) {
  let canDrag = false;
  let classes = Array.from(el.classList);
  draggableClasses.forEach((draggable) => {
    if (classes.indexOf(draggable) !== -1) canDrag = true;
  });
  return canDrag;
}

function inRange(event) {
  let rangeBox = getRangeBox(event);
  let direction = rangeBox.dataset.direction;
  let playerOffset = document.querySelector("#player").offsetLeft + 26;
  let min = playerOffset - rangeBox.offsetLeft;
  let max = min + rangeBox.offsetWidth;
  if (event.clientX < min || event.clientX > max) {
    return false;
  }
  return true;
}

function updateProgress() {
  let current = player.currentTime;
  let percent = (current / player.duration) * 100;
  progress.style.width = percent + "%";

  currentTime.textContent = formatTime(current);
}

function getRangeBox(event) {
  let rangeBox = event.target;
  let el = currentlyDragged;
  if (event.type == "click" && isDraggable(event.target)) {
    rangeBox = event.target.parentElement.parentElement;
  }
  if (event.type == "mousemove") {
    rangeBox = el.parentElement.parentElement;
  }
  return rangeBox;
}

function getCoefficient(event) {
  let slider = getRangeBox(event);
  let playerOffset = document.querySelector("#player").offsetLeft + 26;
  let K = 0;
  let offsetX = event.clientX - playerOffset;
  let width = slider.clientWidth;
  K = offsetX / width;
  return K;
}

function rewind(event) {
  if (inRange(event)) {
    player.currentTime = player.duration * getCoefficient(event);
  }
}

function formatTime(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return min + ":" + (sec < 10 ? "0" + sec : sec);
}

function togglePlay() {
  player.volume = 0.5;

  if (player.paused) {
    player.play();
    togglePlayIcon("play");
  } else {
    player.pause();
    togglePlayIcon("pause");
  }
}

function handlePrevious() {
  if (currentTrack === 0) return;
  handleChange(currentTrack - 1);

  document.querySelector("#previous-icon").classList.remove("fa-pause");
  player.pause();
  togglePlayIcon("pause");
}

function handleNext() {
  if (currentTrack === songs.length) return;
  handleChange(currentTrack + 1);

  document.querySelector("#next-icon").classList.remove("fa-pause");
  player.pause();
  togglePlayIcon("pause");
}

function togglePlayIcon(action) {
  if (action === "play") {
    document.querySelector("#play-icon").classList.remove("fa-play");
    document.querySelector("#play-icon").classList.add("fa-pause");
  } else {
    document.querySelector("#play-icon").classList.remove("fa-pause");
    document.querySelector("#play-icon").classList.add("fa-play");
  }
}

function handleActiveClass(container) {
  container.classList.toggle("active");
}

function renderSongs(song, i) {
  const track = `
    <li class="song" data-audio="${song.audioFile}" style="display:none" id="${i}">
        <img src="${song.cover}" alt="${song.title}">
        <p class="song-title">${song.title}</p>
        <p class="song-artist">${song.artist}</p>
    </li>
`;
  tracksContainer.insertAdjacentHTML("beforeend", track);
}

function handleChange(position = 0) {
  currentTrack = position;

  const song = songs[currentTrack];

  if (song) {
    document.querySelector("audio").setAttribute("src", song.audioFile);
    document.querySelector("img").setAttribute("src", song.cover);
    document.querySelector(".song-title").textContent = song.title;
    document.querySelector(".song-artist").textContent = song.artist;
    document.querySelector("body").style.backgroundColor = song.color;
    document.querySelector("title").textContent = song.title;
    player.load();
    player.currentTime = 0;
  }
}

handleChange();
