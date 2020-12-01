import {
  CallaClient,
  canChangeAudioOutput
} from "/libs/calla.js";
import { JITSI_HOST, JVB_HOST, JVB_MUC, welcome, title, description1, description2 } from "/utils/config.js";
/* import Scene from "/modules/scene.js" */
import User from "/modules/user.js"
import Table from "/modules/table.js"

const controls = Array.prototype.reduce.call(
  document.querySelectorAll("[id]"),
  (ctrls, elem) => {
    ctrls[elem.id] = elem;
    return ctrls;
  }, {});

const gameWidth = document.querySelector("#space").offsetWidth
const gameHeight = document.querySelector("#space").offsetHeight

const client = new CallaClient(JITSI_HOST, JVB_HOST, JVB_MUC);

const users = new Map();

/* var message = document.getElementById("message"); */

/* // Execute a function when the user releases a key on the keyboard
message.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    client.sendTextMessage(controls.userName.value + ':' + message.value)
  }
});
 */
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


/* controls.connect.addEventListener("click", connect);
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

  client.join(roomName, userName);
} */

let timer = null;
client.addEventListener("videoConferenceJoined", (evt) => {
  const { id, displayName, pose } = evt;
  const scene = game.scene.scenes[1]
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
  const scene = game.scene.scenes[1]
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
  for (let user of users.values()) {
    if (client.localUserID == user.id) {
      player = user.avatarcontainer
    }
  }
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


let player = null
let destination = null

function preload() {
  this.load.image('clown', 'assets/clown.png');
  this.load.image('brick', 'assets/brick.png');
  this.load.image('floor', 'assets/floor.png');
  this.load.image('table', 'assets/table.png');
}
function create() {
  this.scale.on('resize', resize, this);

  /*   const floor = this.add.tileSprite(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 'floor') */
  /*   const table1 = new Table('1', this, this.scale.width / 2 - 300, this.scale.height / 2 - 100)
    const table2 = new Table('2', this, this.scale.width / 2 + 300, this.scale.height / 2 - 100)
    const table3 = new Table('3', this, this.scale.width / 2 - 300, this.scale.height / 2 + 100)
    const table4 = new Table('4', this, this.scale.width / 2 + 300, this.scale.height / 2 + 100) */

  /*   this.input.on('pointerdown', function (pointer) {
      for (let user of users.values()) {
        if (client.localUserID == user.id) {
          this.physics.world.enableBody(user.avatarcontainer);
          player = user.avatarcontainer
          destination = { x: pointer.x, y: pointer.y }
          user.avatarcontainer.body.setSize(100, 100, 100, 100);
          this.physics.moveToObject(user.avatarcontainer, pointer, 1000);
        }
      }
    }, this) */

  this.input.keyboard.on('keydown_UP', function (event) {
    player.setPosition(player.x, player.y - 5)
    setPosition(player.x, player.y - 5)
  });
  this.input.keyboard.on('keydown_DOWN', function (event) {
    player.setPosition(player.x, player.y + 5)
    setPosition(player.x, player.y + 5)
  });
  this.input.keyboard.on('keydown_LEFT', function (event) {
    player.setPosition(player.x - 5, player.y)
    setPosition(player.x - 5, player.y)
  });
  this.input.keyboard.on('keydown_RIGHT', function (event) {
    player.setPosition(player.x + 5, player.y)
    setPosition(player.x + 5, player.y)
  });
  table1.table.setInteractive().on('pointerdown', function (pointer) {
    this.scene.start('demo', { id: 2 });
  });
}

function updated() {
  /*  if (destination !== null && player.body.hitTest(destination.x, destination.y)) {
     player.body.stop()
   } */
}

function resize(gameSize, baseSize, displaySize, resolution) {
  var width = gameSize.width;
  var height = gameSize.height;

  this.cameras.resize(width, height);

  /*       this.bg.setSize(width, height); */
  /* this.logo.setPosition(width / 2, height / 2); */
}

var SceneC = {
  key: 'SceneC',
  preload: function preload() { this.load.image('clown', 'assets/clown.png'); this.load.image('sticky', 'assets/sticky.png') },

  create: function create() {
    const roomName = controls.roomName.value;
    const userName = controls.userName.value;
    client.join(roomName, userName);
    console.log(this.scale)
    let sticky = this.add.image(this.scale.width / 2, this.scale.height / 2, 'sticky')
    this.input.keyboard.on('keydown_UP', function (event) {
      player.setPosition(player.x, player.y - 5)
      setPosition(player.x, player.y - 5)
    });
    this.input.keyboard.on('keydown_DOWN', function (event) {
      player.setPosition(player.x, player.y + 5)
      setPosition(player.x, player.y + 5)
    });
    this.input.keyboard.on('keydown_LEFT', function (event) {
      player.setPosition(player.x - 5, player.y)
      setPosition(player.x - 5, player.y)
    });
    this.input.keyboard.on('keydown_RIGHT', function (event) {
      player.setPosition(player.x + 5, player.y)
    });

  }
}

var SceneA = {
  key: 'SceneA',


  preload: function preload() {
    this.load.image('clown', 'assets/clown.png');
    this.load.image('brick', 'assets/brick.png');
    this.load.image('floor', 'assets/floor.png');
    this.load.image('table', 'assets/table.png');
  },
  create: function create() {
    this.scale.on('resize', resize, this);
    let welcome = this.add.text(570, 50, '歡迎來到第xx次開放政府協作會議', {
      fontFamily: '"Noto Sans", sans-serif',
      fontSize: '30px',
      color: 'black'
    })
    const title = this.add.text(700, 150, '向海致敬', {
      fontFamily: '"Noto Sans", sans-serif',
      fontSize: '48px',
      color: 'black'
    })
    const description1 = this.add.text(550, 350, '目前議程已到下半場分小組討論時間', {
      fontFamily: '"Noto Sans", sans-serif',
      fontSize: '30px',
      color: 'black'
    })
    const description2 = this.add.text(680, 450, '請點選進入以下分組', {
      fontFamily: '"Noto Sans", sans-serif',
      fontSize: '30px',
      color: 'black'
    })
    const table1 = new Table('第一組', this, 300, 600)
    const table2 = new Table('第二組', this, 800, 600)
    const table3 = new Table('第三組', this, 1300, 600)
    /*   const floor = this.add.tileSprite(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 'floor') */
    /*  const table1 = new Table('第一組', this, this.scale.width / 2 - 300, this.scale.height / 2 - 100)
     const table2 = new Table('第二組', this, this.scale.width / 2 + 300, this.scale.height / 2 - 100)
     const table3 = new Table('第三組', this, this.scale.width / 2 - 300, this.scale.height / 2 + 100)
     const table4 = new Table('第四組', this, this.scale.width / 2 + 300, this.scale.height / 2 + 100) */

    /*   this.input.on('pointerdown', function (pointer) {
        for (let user of users.values()) {
          if (client.localUserID == user.id) {
            this.physics.world.enableBody(user.avatarcontainer);
            player = user.avatarcontainer
            destination = { x: pointer.x, y: pointer.y }
            user.avatarcontainer.body.setSize(100, 100, 100, 100);
            this.physics.moveToObject(user.avatarcontainer, pointer, 1000);
          }
        }
      }, this) */
    table1.table.setInteractive().on('pointerdown', function (pointer) {
      this.scene.scene.start('SceneC', { id: 2 });
    });
    table2.table.setInteractive().on('pointerdown', function (pointer) {
      this.scene.scene.start('SceneC', { id: 2 });
    });
    table3.table.setInteractive().on('pointerdown', function (pointer) {
      this.scene.scene.start('SceneC', { id: 2 });
    });
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
    arcade: { debug: false }
  },
  scene: [SceneA, SceneC]
};

let game = new Phaser.Game(config);