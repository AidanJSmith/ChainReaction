const WebSocket = require('ws')
const url = 'ws://localhost:8081'
const connection = new WebSocket(url)
const userRegExample = {
    "type": "ready",
    "name":"AYsdasdasssAssN",
    "id":"1"
}
const wordRegExample = {
    "type": "switchTeams",
    "word":"hemoglobin",
    "id":"1"
}
const wordRegExample2 = {
    "type": "addWord",
    "word":"hemoglobineee",
    "id":"1"
}
const serverRegExample = {
    "type": "newGame",
    "name":"horseP2aste",
    "id":"1"
}
connection.onopen = () => {
    connection.send(JSON.stringify(wordRegExample));
   // connection.send(JSON.stringify(wordRegExample2));
  
    //setTimeout(()=> {connection.send(JSON.stringify(userRegExample))},200);
}

connection.onerror = (error) => {
    console.log(`WebSocket error: ${error}`)
}

connection.onmessage = (e) => {
    console.log(e.data)
}