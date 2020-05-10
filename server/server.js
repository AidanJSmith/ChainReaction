// server.js
 
const WebSocket = require('ws')
const Promise = require('bluebird')
const AppDAO = require('./dao')
const ServerRepository = require('./server_repository')

const wss = new WebSocket.Server({ port: 8081 })
const dao = new AppDAO('./database.sqlite3')
const db = new ServerRepository(dao)
db.createTable();
wss.broadcast = function broadcast(msg) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        client.send(msg);
     });
 };
function sendWord(word,id,currentTeam) {
    if (word==null) {
        //game over things
    } 
    wss.broadcast(JSON.stringify({"type":"word","word" : word,"team":currentTeam}));
    // console.log(wss.clients);
}

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(message);
    message=JSON.parse(message);
    switch(message.type) {
        case "signup":
            console.log("JOINED: " + message.name)
            db.join(message.name,message.id);
            break;
        case "addWords":
          console.log("WORDS ADDED: " + message.words);
          db.addWords(message.id,message.words)
          break;
        case "nextWord":
            db.nextWord(message.id,sendWord);
            break;
        case "goAdd":
            function precallback() {
                function recall(message2) {
                    wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                } 
                db.getMyServer(message.id,recall);
            }
            db.goAdd(message.id,precallback);
            break;
        case "wordCorrect":
            db.wordCorrect(message.id,sendWord);
            break;
        case "skipWord":
            db.skipWord(message.id,sendWord);
            break;
          // code block
        case "getIDbyName":
            function newFunc(message) {
                ws.send(JSON.stringify({type:"updateID",id:message}));
            }
            db.getID(message.name,newFunc);
            break;
        case "heartBeat":
            break;
        case "newGame":
            //Eventually check to see if game exists already
            db.create(message.name);
            break;
        case "ready":
            //Go to next round. MasterUser On Each Team Has the ability to do this.
            function callback(state,score) {
                wss.broadcast(JSON.stringify({"type":"stateUpdate","state" : state,"score":score})); //Do something with the current word here as well.
                db.nextWord(message.id,sendWord);
            }
            db.ready(message.id,callback);
            
            break;
        case "unready":
            db.unready(message.id);
            wss.broadcast(JSON.stringify({"type":"stateUpdate","state" : "WAITING_FOR_PLAYERS"}));
            break;
        case "switchTeams":
            function precallback() {
                function recall(message2) {
                    wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                } 
                db.getMyServer(message.id,recall);
            }
            db.makeTeams(message.id,precallback);
            break;
        case "getData":
            function recall(message) {
                wss.broadcast(JSON.stringify({type:"updateState",data:message}));
            } 
            db.getMyServer(message.id,recall);
        default:
            console.error(JSON.stringify({"type":"err"}));
            
        
      } 
  })
  ws.send(JSON.stringify({"type":"startup"}))
})
