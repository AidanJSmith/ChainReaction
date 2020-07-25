// server.js
 
const { Server } = require('ws');
var clients={};
const AppDAO = require('./dao')
const ServerRepository = require('./server_repository')
var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use(express.static('dist'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
  

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
function resetState(message,id=0) {
    wss.broadcast(JSON.stringify({type:"reset",data:message}));
}
function getServerReset(id) {
    db.getMyServer(id,resetState);
}
function patchSecondary(message,id=0) {
    wss.broadcast(JSON.stringify({type:"patchCorrectIncorrect",data:message}));
}
function patchState(id=0) { // Change words in place, for things like editing if a word was correct or not.
    db.getMyServer(id,patchSecondary);
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
                console.log("Auto GM disabled for usability.")
                // wss.broadcast(JSON.stringify({type:"becomeMaster",data:true}));
            }
            db.join(message.name,message.id,ifFirstSetMaster);
            break;
        case "addWords":
          console.log("WORDS ADDED: " + message.words);
          function goToPause() {
            db.pause(message.id,getServerUpdateState);
          }
          function goToReady() {
            db.ready(message.id,goToPause);
          }
          db.addWords(message.id,message.words,goToReady)
          break;
        case "nextWord":
            db.nextWord(message.id,getServerUpdateState,false);
            break;
        case "heartbeat":
            break;
        case "goAdd":
            db.goAdd(message.id,getServerUpdateState);
            break;
        case "wordIncorrect":
            db.nextWord(message.id,getServerUpdateState,false);
            break;
        case "wordCorrect":
            //Go to next round. MasterUser On Each Team Has the ability to do this.
            function wordCorrectCallback(id) {
                console.log("Next word")
                db.nextWord(message.id,getServerUpdateState,true);
            }
            db.wordCorrect(message.id,wordCorrectCallback,true);
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
        case "reset":
            db.reset(message.id,getServerReset);
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
            setTimeout(() => {db.pause(message.id,goPause)},4500);
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
            setTimeout(() => {db.pause(message.id,goPause)},9000);
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
        case "swapFalse":
            db.swapFalse(message.id,message.word,patchState);
            break;
        case "swapTrue":
            db.swapTrue(message.id,message.word,patchState);
            break;
        default:
            console.error(JSON.stringify({"type":"err","message":message}));
            break;
            
        
      } 
  })
  ws.send(JSON.stringify({"type":"startup"}))
})
