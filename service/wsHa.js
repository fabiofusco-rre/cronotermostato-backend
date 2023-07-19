var W3CWebSocket = require("websocket").w3cwebsocket;


exports.initWS = (host, token)=>{
  console.log("INNER initWS ")
  console.log("INNER initWS - W3CWebSocket")
  const socket = new W3CWebSocket(`ws://${host}/api/websocket`);
  console.log("INNER initWS - W3CWebSocket - result")
  console.log("INNER initWS - open")
  socket.onopen = () => {
    socket.send(JSON.stringify({type: "auth", access_token: token}));
  }
  
  return new Promise((resolve, reject)=>{
    try {
      socket.onmessage = (e) => {
        if (typeof e.data === "string") {
          console.log("soket promise recive message ",  e.data)
          if (JSON.parse(e.data).type === "auth_ok") {
            resolve(socket);
          }
        }
      }
    } catch (error) {
      console.log("[ERROR] soket promise recive message ", error)
      reject(error)
    }
  })
}

exports.closeWS = (socket)=>{
  socket.close();
  return new Promise((resolve)=>{
    socket.onclose = ()=>{
      resolve(true)
    }
  })
}

exports.getDeviceRegistry = (socket)=>{
  const serviceType = "config/device_registry/list"
  return callWsService(socket, serviceType);
}

exports.getEntityRegistry = (socket)=>{
  const serviceType = "config/entity_registry/list"
  return callWsService(socket, serviceType);
}




const callWsService = (socket, serviceType)=>{
  const idCall = new Date().getTime()
  socket.send(JSON.stringify({ type: serviceType, id: idCall }));
  return new Promise((resolve, reject)=>{
    try {
      socket.onmessage = (e) => {
        if (typeof e.data === "string") {
          if (JSON.parse(e.data).id === idCall) {
            resolve(JSON.parse(e.data)?.result);
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  })
}






