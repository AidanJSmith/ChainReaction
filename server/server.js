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
    message=JSON.parse(message);
    switch(message.type) {
        case "signup":
            console.log("JOINED: " + message.name)
            db.join(message.name,message.id);
            ws.send("OK"); //Eventually send all the current info about the game.
            break;
        case "addWord":
          console.log("WORD ADDED: " + message.word);
          db.addWord(message.word,message.id)
          ws.send("OK");
          break;
        case "nextWord":
            db.nextWord(message.id,sendWord);
            break;
        case "wordCorrect":
            db.wordCorrect(message.id,sendWord);
            break;
        case "skipWord":
            db.skipWord(message.id,sendWord);
            break;
          // code block
        case "newGame":
            //Eventually check to see if game exists already
            db.create(message.name);
            break;
        case "ready":
            //Go to next round. MasterUser On Each Team Has the ability to do this.
            function callback(state) {
                wss.broadcast(JSON.stringify({"type":"stateUpdate","state" : state})); //Do something with the current word here as well.
                db.nextWord(message.id,sendWord);
            }
            db.ready(message.id,callback);
            
            break;
        case "unready":
            db.unready(message.id);
            wss.broadcast(JSON.stringify({"type":"stateUpdate","state" : "WAITING_FOR_PLAYERS"}));
            break;
        case "switchTeams":
            db.makeTeams(message.id);
            break;
        default:
            console.error("There was an error in that query.");
            
        
      } 
  })
  ws.send('Connected.')
})
