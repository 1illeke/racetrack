function logout() {
function getLoginSession(cookie_string) {
  let cookies = cookie_string.split(';')
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
  const socket = io({ transports: ['websocket'] })
  socket.emit("logout", getLoginSession(document.cookie))
  setTimeout(function() {
    document.cookie = "session=\"\"; expires=-1"
    window.location.href = 'login';
  }, 100)
}
