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
    message=JSON.parse(message);
    console.log(message);
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
            function calloncemore(state, score) {
                    function finalCallBack(message2) {
                         wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                    }
                    console.log("FINAL")
                    db.getMyServer(message.id,finalCallBack);
            }
            db.nextWord(message.id,calloncemore);
            break;
        case "goAdd":
            function precallbackee() {
                function recall(message2) {
                    wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                } 
                db.getMyServer(message.id,recall);
                console.log("ADDING");
            }
            console.log("ADDING");
            db.goAdd(message.id,precallbackee);
            break;
        case "wordCorrect":
                          //Go to next round. MasterUser On Each Team Has the ability to do this.
            function keepcall(state, score) {
                console.log();
                function recall() {
                    function finalCallBack(message2) {
                         wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                    }
                    console.log("FINAL")
                    db.getMyServer(message.id,finalCallBack);
                } 
                console.log("Next word")
                db.wordCorrect(message.id,recall);
            }
            console.log("Working")
            db.nextWord(message.id,keepcall);
            break;
        case "skipWord":
            function calloncemore(state, score) {
                    function finalCallBack(message2) {
                        wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                    }
                    console.log("FINAL")
                    db.getMyServer(message.id,finalCallBack);
            }
            db.skipWord(message.id,calloncemore);
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
        case "pause":
            function precallback() {
                function recall(message2) {
                    wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                } 
                db.getMyServer(message.id,recall);
            }
            db.pause(message.id,callback);
            break;
        case "ready":
            //Go to next round. MasterUser On Each Team Has the ability to do this.
            function calloncemore(state, score) {
                console.log();
                function recall() {
                    function finalCallBack(message2) {
                         wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                    }
                    console.log("FINAL")
                    db.getMyServer(message.id,finalCallBack);
                } 
                console.log("Next word")
                db.ready(message.id,recall);
            }
            console.log("Working")
            db.nextWord(message.id,calloncemore);
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
            break;
        default:
            console.error(JSON.stringify({"type":"err"}));
            break;
            
        
      } 
  })
  ws.send(JSON.stringify({"type":"startup"}))
})
