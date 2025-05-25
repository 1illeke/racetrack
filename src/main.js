import * as fs from "node:fs"
import * as http from "node:http"
import * as path from "node:path"
import { Server } from "socket.io"
import { v7 as uuidv7 } from 'uuid'

let any_key_undefined = false
function isUndefined(key) { console.log(`${key} not defined`); any_key_undefined = true; }
const receptionist_key = process.env.receptionist_key || isUndefined("receptionist_key")
const observer_key = process.env.observer_key || isUndefined("observer_key")
const safety_key = process.env.safety_key || isUndefined("safety_key")
if (any_key_undefined) process.exit()

const RACE_LENGTH_MILLISECONDS = process.env.NODE_ENV == "DEVELOPMENT" ? 60*1000 : 10*60*1000
const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
}


function isLoggedIn(cookie, name) {
  return cookie !== undefined && cookie.name === name && state.sessions[name].includes(cookie.id)
}

const prepareFile = async (url) => {
  const STATIC_PATH = path.join(process.cwd(), "./src/client")
  const paths = [STATIC_PATH, url]
  const filePath = path.join(...paths)
  const pathTraversal = !filePath.startsWith(STATIC_PATH)
  const exists = await fs.promises.access(filePath).then(() => true, () => false)
  const found = !pathTraversal && exists
  const streamPath = found ? filePath : path.join(STATIC_PATH, "404.html")
  const ext = path.extname(streamPath).substring(1).toLowerCase()
  const stream = fs.createReadStream(streamPath)
  return { found, ext, stream }
}

function getLoginSession(req) {
  if (req.headers.cookie === undefined) return
  let cookies = req.headers.cookie.split(';')
  const COOKIE_NAME = 'session='
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.startsWith(COOKIE_NAME)) {
      cookie = cookie.substring(COOKIE_NAME.length)
      try {
	return JSON.parse(cookie)
      } catch {}
    }
  }
  return
}


const PORT = 8000
const URL = `0.0.0.0`
const server = http.createServer(
  async (req, res) => {
    let session = getLoginSession(req)
    if (req.url.endsWith(".html")) req.url = "/404.html"
    if (!req.url.includes(".")) {
      switch (req.url) {
	case "/front-desk": if (isLoggedIn(session, "reception")) req.url += ".html"; break
	case "/race-control": if (isLoggedIn(session, "safety")) req.url += ".html"; break
	case "/lap-line-tracker": if (isLoggedIn(session, "observer")) req.url += ".html"; break

	case "/login":
	case "/leader-board":
	case "/next-race":
	case "/race-countdown":
	case "/race-flags":
	  req.url += ".html"; break

	default: req.url = "/404.html"
      }
    }

    const file = await prepareFile(req.url)
    const statusCode = file.found ? 200 : 404
    const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default
    res.writeHead(statusCode, { "Content-Type": mimeType })
    file.stream.pipe(res)
    console.log(`-----\n${req.method} ${req.url} ${statusCode}`)
  }
).listen(PORT, URL, () => {
  console.log(`Server running at http://${URL}:${PORT}/`)
})

const io = new Server(server, {
  transports: ['websocket']
})
let state = {
  sessions: {
    reception: [],
    observer: [],
    safety: []
  },
  raceSessions: [],
  drivers: []
}

const SERVER_STATE_PATH = './server-state.json'
function loadState() {
  try {
    const json = fs.readFileSync(SERVER_STATE_PATH, 'utf8')
    if (json) state = {...state, ...JSON.parse(json)}// default to empty arrays
  } catch (err) {}
}

loadState()

function saveState() {
  fs.writeFileSync(SERVER_STATE_PATH, JSON.stringify(state), 'utf8')
}

const RaceMode = {
  SAFE: 0,
  HAZARD: 1,
  DANGER: 2,
  FINISH: 3,
}

function endRace() {
  state.raceSessions[0].running = false
  state.raceSessions[0].mode = RaceMode.DANGER
  state.raceSessions[0].finished = true
  io.emit('race-update', state.raceSessions[0])
  io.emit('race-session-update', state.raceSessions)
}

io.on("connection", function (socket) {
  socket.emit('race-update', state.raceSessions[0])
  socket.emit('race-session-update', state.raceSessions)
  socket.emit('driver-update', state.drivers)

  socket.on("login", function (key) {
    let id = uuidv7()
    let name = ""
    switch (key) {
      default: // invalid key
        setTimeout(function() {
          socket.emit("login response", {})
      }, 500); return
      case receptionist_key: name = 'reception'; break
      case observer_key: name = 'observer'; break
      case safety_key: name = 'safety'; break
    }

    state.sessions[name].push(id)
    socket.emit('login response', { name, id })
  })
  socket.on("logout", function (session) {
    if (!session) return
    if (!state.sessions[session.name]) {
      console.log(JSON.stringify(session), 'session not found')
      return
    }
    state.sessions[session.name].splice(state.sessions[session.name].indexOf(session.id), 1)
  })

  //socket.on('disconnect', function() {
  //  let cookie = socket.handshake.headers.cookie
  //  if (!cookie) return

  //  let session = JSON.parse(cookie)
  //  if (!state.sessions[session.name]) return
  //  state.sessions[session.name].splice(state.sessions[session.name].indexOf(session.id), 1)
  //})

  socket.on('race-mode-change', function(mode){
    if (!state.raceSessions[0]) return
    state.raceSessions[0].mode = mode
    io.emit('race-update', state.raceSessions[0])
  })

  socket.on('driver-update', function(drivers){
    state.drivers = drivers
    io.emit('driver-update', state.drivers)
  })

  socket.on('update-race', function(editedRaceIndex, race) {
    state.raceSessions[editedRaceIndex] = race
    console.log(race)
    io.emit('race-session-update', state.raceSessions)
  })

  socket.on('add-race', function(race){
    state.raceSessions.push(race)
    state.raceSessions.sort((a,b) => {
      return a.start - b.start
    })
    io.emit('race-session-update', state.raceSessions)
  })
  socket.on('delete-race', function(index){
    state.raceSessions.splice(index,1)
    io.emit('race-session-update', state.raceSessions)
  })

  socket.on('lap-line', function(number, time) {
    if (state.raceSessions.length === 0) return
    function addLap(driver, time) {
      if (!driver.laps) driver.laps = []
      if (!driver.firstLap) driver.firstLap = time
      else {
	console.log(driver.laps.at(-1))
	driver.laps.push(time-(driver.laps.reduce((sum,a)=> sum+a, driver.firstLap)))
      }
    }

    for (let i = 0; i < state.raceSessions[0].drivers.length; i++) {
      let driver = state.raceSessions[0].drivers[i]
      if (driver.carNumber !== number) continue

      addLap(state.raceSessions[0].drivers[i], time)

      console.log(driver)


    }
    io.emit('race-update', state.raceSessions[0])
  })

  socket.on('race-start', function(){
    if (state.raceSessions.length === 0) return
    if (state.raceSessions[0] && state.raceSessions[0].running) return
    if (state.raceSessions[0].finished) {
      if (state.raceSessions.length === 1) return
      state.raceSessions.shift()
    }
    state.raceSessions[0] = {
      drivers: state.raceSessions[0].drivers,
      end: Date.now() + RACE_LENGTH_MILLISECONDS,
      start: Date.now(),
      mode: RaceMode.SAFE,
      running: true
    }
    io.emit('race-update', state.raceSessions[0])
    io.emit('race-session-update', state.raceSessions)
  })
  socket.on('race-end', function(){
    endRace()
  })
})


setInterval(function() { // main loop
  if (state.raceSessions.length === 0) return
  if (state.raceSessions[0].mode == RaceMode.FINISH) return
  if (state.raceSessions[0].finished) return
  if (Date.now() > state.raceSessions[0].end) {
    state.raceSessions[0].mode = RaceMode.FINISH
    io.emit('race-update', state.raceSessions[0])
  }
  io.emit('timer-update', state.raceSessions[0].end)
}, 10)

const signals = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM']
signals.forEach((eventType) => {
  process.on(eventType, function(...args) {
    console.log(...args)
    saveState()
    console.log('-----server closed\n\n\n')
    process.exit()
  })
})
