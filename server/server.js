// server.js
 
const { Server } = require('ws');
var clients={};
const Promise = require('bluebird')
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
function sendWord(word,id,currentTeam) {
    if (word==null) {
        //game over things
    } 
    wss.broadcast(JSON.stringify({"type":"word","word" : word,"team":currentTeam}));
    // console.log(wss.clients);
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
            function replacethisinrewrite1(state, score) {
                    function finalCallBack(message2) {
                         wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                    }
                    db.getMyServer(message.id,finalCallBack);
            }
            db.nextWord(message.id,replacethisinrewrite1);
            break;
        case "heartbeat":
            break;
        case "goAdd":
            function precallbackee() {
                function recall(message2) {
                    wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                } 
                db.getMyServer(message.id,recall);
            }
            db.goAdd(message.id,precallbackee);
            break;
        case "wordIncorrect":
            function recallx3() {
                function finalCallBack(message2) {
                        wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                }
                db.getMyServer(message.id,finalCallBack);
            } 

            db.nextWord(message.id,recallx3,false);
            break;
        case "wordCorrect":
                          //Go to next round. MasterUser On Each Team Has the ability to do this.
            function keepcall(state, score) {
                console.log();
                function recall() {
                    function finalCallBack(message2) {
                         wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                    }
                    console.log("Sending Next Word")
                    db.getMyServer(message.id,finalCallBack);
                } 
                console.log("Next word")
                db.wordCorrect(message.id,recall);
            }
            db.nextWord(message.id,keepcall);
            break;
        case "skipWord":

            function recallx2() {
                function finalCallBack(message2) {
                        wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                }
                console.log("FINAL")
                db.getMyServer(message.id,finalCallBack);
            } 

            db.skipWord(message.id,recallx2);
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
            function goPause(state, score) {
                function lastCallb(message2) {
                        wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                }
                console.log("Going To Pause")
                db.getMyServer(message.id,lastCallb);
            } 
            console.log("Working")
            db.nextWord(message.id,calloncemore);
            setTimeout(() => {db.pause(message.id,goPause)},45000);
            break;
        case "readyPause":
            console.log("ReadyPause Recieved")
            function calloncemore(state, score) {
                console.log();
                function recall() {
                    function finalCallBack(message2) {
                         wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                    }
                    db.getMyServer(message.id,finalCallBack);
                } 
                db.ready(message.id,recall);
            }
            function goPause(state, score) {
                function lastCallb(message2) {
                        wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                }
                db.getMyServer(message.id,lastCallb);
            } 
            calloncemore();
            setTimeout(() => {db.pause(message.id,goPause)},90000);
            break;
        case "unready":
            db.unready(message.id);
            wss.broadcast(JSON.stringify({"type":"stateUpdate","state" : "WAITING_FOR_PLAYERS"}));
            break;
        case "switchTeams":
            function precallback2() {
                function recall(message2) {
                    wss.broadcast(JSON.stringify({type:"updateState",data:message2}));
                } 
                db.getMyServer(message.id,recall);
            }
            db.makeTeams(message.id,precallback2);
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
