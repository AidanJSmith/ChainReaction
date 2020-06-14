// server.js
 
const { Server } = require('ws');
var clients={};
const AppDAO = require('./dao')
const ServerRepository = require('./server_repository')
var express = require('express');
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });
const dao = new AppDAO('./database.sqlite3')
const db = new ServerRepository(dao)


db.createTable();
wss.broadcast = function broadcast(msg) {
    wss.clients.forEach(function each(client) {
        client.send(msg);
     });
 };

function updateState(message,id=0) {
    wss.broadcast(JSON.stringify({type:"updateState",data:message}));
}
function getServerUpdateState(id) {
    db.getMyServer(id,updateState);
}
wss.on('connection', (ws,req) => {
  ws.on('message', message => {
    message=JSON.parse(message);
    switch(message.type) {
        case "signup":
            console.log("JOINED: " + message.name)
            function ifFirstSetMaster() {
                wss.broadcast(JSON.stringify({type:"becomeMaster",data:true}));
            }
            db.join(message.name,message.id,ifFirstSetMaster);
            break;
        case "addWords":
          console.log("WORDS ADDED: " + message.words);
          db.addWords(message.id,message.words)
          break;
        case "nextWord":
            db.nextWord(message.id,getServerUpdateState);
            break;
        case "heartbeat":
            break;
        case "goAdd":
            db.goAdd(message.id,getServerUpdateState);
            break;
        case "wordIncorrect":
            db.nextWord(message.id,getServerUpdateState);
            break;
        case "wordCorrect":
            //Go to next round. MasterUser On Each Team Has the ability to do this.
            function wordCorrectCallback(state, score) {
                console.log("Next word")
                db.wordCorrect(message.id,getServerUpdateState);
            }
            db.nextWord(message.id,wordCorrectCallback);
            break;
        case "skipWord":
            db.skipWord(message.id,getServerUpdateState);
            break;
          // code block
        case "getIDbyName":
            function updateIDCallback(message) {
                ws.send(JSON.stringify({type:"updateID",id:message}));
            }
            db.getID(message.name,updateIDCallback);
            break;
        case "heartBeat":
            break;
        case "newGame":
            //Eventually check to see if game exists already
            db.create(message.name);
            break;
        case "pause":
            db.pause(message.id,getServerUpdateState);
            break;
        case "ready":
            //Go to next round. MasterUser On Each Team Has the ability to do this.
            function readyCallback() {
                console.log("Next word")
                db.ready(message.id,getServerUpdateState);
            }
            function goPause() {
                console.log("Going To Pause")
                db.getMyServer(message.id,updateState);
            } 
            console.log("Working")
            db.nextWord(message.id,readyCallback);
            setTimeout(() => {db.pause(message.id,goPause)},45000);
            break;
        case "readyPause":
            console.log("ReadyPause Recieved")
            function readyCallback() {
                console.log("Next word")
                db.ready(message.id,getServerUpdateState);
            }
            function goPause() {
                console.log("Going To Pause")
                db.getMyServer(message.id,updateState);
            } 
            readyCallback();
            setTimeout(() => {db.pause(message.id,goPause)},90000);
            break;
        case "unready":
            db.unready(message.id);
            wss.broadcast(JSON.stringify({"type":"stateUpdate","state" : "WAITING_FOR_PLAYERS"}));
            break;
        case "switchTeams":
            db.makeTeams(message.id,getServerUpdateState);
            break;
        case "getData":
            db.getMyServer(message.id,updateState);
            break;
        default:
            console.error(JSON.stringify({"type":"err"}));
            break;
            
        
      } 
  })
  ws.send(JSON.stringify({"type":"startup"}))
})
