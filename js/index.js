import { CallaClient, canChangeAudioOutput } from './calla.js'
import { host, jvb, muc, welcome, title } from '../utils/config.js'
import User from '/modules/user.js'

const client = new CallaClient(host, jvb, muc)
const users = new Map()

const game = document.querySelector('#game')
const photoContainer = document.querySelector('#photoContainer')
const downloadButton = document.querySelector('#downloadButton')

const Init = (() => {
  document.querySelector('#welcome').innerHTML = welcome
  document.querySelector('#title').innerHTML = title
})()

document.getElementById('group1').addEventListener('click', () => {
  GameStart('1')
})

document.getElementById('group2').addEventListener('click', () => {
  GameStart('2')
})

/* document.getElementById('group3').addEventListener('click', () => {
  GameStart('3')
}) */

const GameStart = (group) => {
  const queryString = window.location.search
  if (queryString.includes('admin')) {
    configButton.style.display = 'inline'
  }
  game.style.display = 'block'
  game.style['z-index'] = 9999
  const img = document.createElement('img')
  img.crossOrigin = 'Anonymous'
  img.src = `https://photo.pdis.dev/api/group/${group}`
  photoContainer.appendChild(img)
  setInterval(() => {
    var source = `https://photo.pdis.dev/api/group/${group}`,
      timestamp = new Date().getTime(),
      newUrl = source + '?_=' + timestamp
    img.src = newUrl
  }, 10000)
  client.join(group, username.value)
}

downloadButton.addEventListener('click', () => {
  const photoCanvas = document.createElement('canvas')
  const img = document.querySelector('img')
  photoCanvas.height = 2160
  photoCanvas.width = 4096
  let photoContext = photoCanvas.getContext('2d')
  photoContext.drawImage(img, 0, 0)
  photoCanvas.toBlob((blob) => {
    let data = window.URL.createObjectURL(blob)
    let link = document.createElement('a')
    link.href = data
    link.download = 'photo.png'
    link.click()
  }, 'image/png')
})

let timer = null
client.addEventListener('videoConferenceJoined', (evt) => {
  const { id, displayName, pose } = evt
  timer = requestAnimationFrame(update)
  addUser(id, displayName, pose, true)
  setPosition(
    Math.random() * (game.clientWidth - 100) + 50,
    Math.random() * (game.clientHeight - 100) + 50
  )
})

client.addEventListener('videoConferenceLeft', () => {
  removeUser(client.localUserID)
  cancelAnimationFrame(timer)
})

client.addEventListener('participantJoined', (evt) => {
  const { id, displayName, pose } = evt
  addUser(id, displayName, pose, false)
})

client.addEventListener('participantLeft', (evt) => {
  const { id } = evt
  removeUser(id)
})

function addUser(id, name, pose, isLocal) {
  if (users.has(id)) {
    users.get(id).dispose()
  }
  const user = new User(id, name, pose, isLocal)
  game.append(user.container)
  users.set(id, user)
  for (let user of users.values()) {
    if (client.localUserID == user.id) {
    }
  }
}

function removeUser(id) {
  if (users.has(id)) {
    const user = users.get(id)
    user.dispose()
    users.delete(id)
  }
}

function update() {
  timer = requestAnimationFrame(update)
  client.update()
  for (let user of users.values()) {
    user.update()
  }
}

game.addEventListener('click', (evt) => {
  const x = evt.clientX - game.offsetLeft
  const y = evt.clientY - game.offsetTop
  if (x > game.clientWidth - 100 && y > game.clientHeight - 100) {
  } else {
    setPosition(x, y)
  }
})

function setPosition(x, y) {
  if (client.localUserID) {
    x /= 100
    y /= 100
    client.setLocalPosition(x, 0, y)
  }
}

client.addEventListener('displayNameChange', (evt) => {
  const { id, displayName } = evt
  changeName(id, displayName)
})

function changeName(id, displayName) {
  if (users.has(id)) {
    const user = users.get(id)
    user.name = displayName
  }
}

client.addEventListener('videoChanged', (evt) => {
  const { id, stream } = evt
  changeVideo(id, stream)
})

function changeVideo(id, stream) {
  if (users.has(id)) {
    const user = users.get(id)
    user.videoStream = stream
  }
}

;(async function () {
  deviceSelector(
    true,
    controls.mics,
    await client.getAudioInputDevicesAsync(),
    await client.getPreferredAudioInputAsync(true),
    (device) => client.setAudioInputDeviceAsync(device)
  )
  deviceSelector(
    true,
    controls.speakers,
    await client.getAudioOutputDevicesAsync(),
    await client.getPreferredAudioOutputAsync(true),
    (device) => client.setAudioOutputDeviceAsync(device)
  )
  controls.speakers.disabled = !canChangeAudioOutput
})()

function deviceSelector(addNone, select, values, preferredDevice, onSelect) {
  if (addNone) {
    const none = document.createElement('option')
    none.text = 'None'
    select.append(none)
  }
  select.append(
    ...values.map((value) => {
      const opt = document.createElement('option')
      opt.value = value.deviceId
      opt.text = value.label
      if (preferredDevice && preferredDevice.deviceId === value.deviceId) {
        opt.selected = true
      }
      return opt
    })
  )
  select.addEventListener('input', () => {
    let idx = select.selectedIndex

    // Skip the vestigial "none" item.
    if (addNone) {
      --idx
    }

    const value = values[idx]
    onSelect(value || null)
  })
  onSelect(preferredDevice)
}

document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.modal')
  var instances = M.Modal.init(elems)
})
