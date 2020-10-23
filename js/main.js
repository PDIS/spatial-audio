import {
  CallaClient,
  canChangeAudioOutput
} from "/libs/calla.js";
import { JITSI_HOST, JVB_HOST, JVB_MUC } from "/utils/constants.js";
import Scene from "/modules/scene.js"
import User from "/modules/user.js"

const controls = Array.prototype.reduce.call(
  document.querySelectorAll("[id]"),
  (ctrls, elem) => {
    ctrls[elem.id] = elem;
    return ctrls;
  }, {});

const client = new CallaClient(JITSI_HOST, JVB_HOST, JVB_MUC);

const users = new Map();

(async function () {
  deviceSelector(
    true,
    controls.cams,
    await client.getVideoInputDevicesAsync(),
    await client.getPreferredVideoInputAsync(true),
    (device) => client.setVideoInputDeviceAsync(device));
  deviceSelector(
    true,
    controls.mics,
    await client.getAudioInputDevicesAsync(),
    await client.getPreferredAudioInputAsync(true),
    (device) => client.setAudioInputDeviceAsync(device));
  deviceSelector(
    true,
    controls.speakers,
    await client.getAudioOutputDevicesAsync(),
    await client.getPreferredAudioOutputAsync(true),
    (device) => client.setAudioOutputDeviceAsync(device));
  controls.speakers.disabled = !canChangeAudioOutput;
})();

function deviceSelector(addNone, select, values, preferredDevice, onSelect) {
  if (addNone) {
    const none = document.createElement("option");
    none.text = "None";
    select.append(none);
  }
  select.append(...values.map((value) => {
    const opt = document.createElement("option");
    opt.value = value.deviceId;
    opt.text = value.label;
    if (preferredDevice && preferredDevice.deviceId === value.deviceId) {
      opt.selected = true;
    }
    return opt;
  }));
  select.addEventListener("input", () => {
    let idx = select.selectedIndex;

    // Skip the vestigial "none" item.
    if (addNone) {
      --idx;
    }

    const value = values[idx];
    onSelect(value || null);
  });
  onSelect(preferredDevice);
}

controls.connect.disabled = false;


controls.connect.addEventListener("click", connect);
function connect() {
  const roomName = controls.roomName.value;
  const userName = controls.userName.value;

  let message = "";
  if (roomName.length === 0) {
    message += "\n   Room name is required";
  }
  if (userName.length === 0) {
    message += "\n   User name is required";
  }

  if (message.length > 0) {
    message = "Required fields missing:" + message;
    alert(message);
    return;
  }
  controls.roomName.disabled = true;
  controls.userName.disabled = true;
  controls.connect.disabled = true;
  /* client.startAudio(); */

  client.join(roomName, userName);
}

let timer = null;
client.addEventListener("videoConferenceJoined", (evt) => {
  const { id, displayName, pose } = evt;
  const scene = game.scene.scenes[0]
  controls.leave.disabled = false;
  timer = requestAnimationFrame(update);
  addUser(id, displayName, pose, true, scene);
  setPosition(
    Math.random() * (controls.space.clientWidth - 100) + 50,
    Math.random() * (controls.space.clientHeight - 100) + 50);
});

controls.leave.addEventListener("click", () => client.leaveAsync());
client.addEventListener("videoConferenceLeft", () => {
  removeUser(client.localUserID);
  cancelAnimationFrame(timer);
  controls.leave.disabled = true;
  controls.connect.disabled = false;
});

client.addEventListener("participantJoined", (evt) => {
  const { id, displayName, pose } = evt;
  const scene = game.scene.scenes[0]
  addUser(id, displayName, pose, false, scene);
});

client.addEventListener("participantLeft", (evt) => {
  const { id } = evt;
  removeUser(id);
});

function addUser(id, name, pose, isLocal, scene) {
  if (users.has(id)) {
    users.get(id).dispose();
  }
  const user = new User(id, name, pose, isLocal, scene);
  controls.space.append(user.container);
  users.set(id, user);
}

function removeUser(id) {
  if (users.has(id)) {
    const user = users.get(id);
    user.dispose();
    users.delete(id);
  }
}

function update() {
  timer = requestAnimationFrame(update);
  client.update();
  for (let user of users.values()) {
    user.update();
  }
}

controls.space.addEventListener("click", (evt) => {
  const x = evt.clientX - controls.space.offsetLeft;
  const y = evt.clientY - controls.space.offsetTop;
  setPosition(x, y);
});

function setPosition(x, y) {
  if (client.localUserID) {
    x /= 100;
    y /= 100;
    client.setLocalPosition(x, 0, y);
  }
}

client.addEventListener("displayNameChange", (evt) => {
  const { id, displayName } = evt;
  changeName(id, displayName);
});
function changeName(id, displayName) {
  if (users.has(id)) {
    const user = users.get(id);
    user.name = displayName;
  }
}

client.addEventListener("videoChanged", (evt) => {
  const { id, stream } = evt;
  changeVideo(id, stream);
});
function changeVideo(id, stream) {
  if (users.has(id)) {
    const user = users.get(id);
    user.videoStream = stream;
  }
}

let config = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'space',
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 2000 }
    }
  },
  scene: Scene
};

let game = new Phaser.Game(config);
