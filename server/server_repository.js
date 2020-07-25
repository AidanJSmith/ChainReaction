class ServerRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `
      CREATE TABLE IF NOT EXISTS servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        players TEXT,
        words TEXT,
        usedwords TEXT,
        skippedwords TEXT,
        score INTEGER,
        guesser TEXT,
        currentwords TEXT,
        team1 TEXT,
        team2 TEXT,
        state TEXT,
        name TEXT,
        correctwords TEXT,
        incorrectwords TEXT,
        UNIQUE(name)
        )`
        return this.dao.run(sql)
    }
    /*
    GUESSER: an integer that represents the current integer (wraps around) of the current team's players (sorted); This can be initialized to a value.
    States:
        WAIT_FOR_PLAYERS
        READYING
        TEAM1_GUESS
        TEAM2_GUESS
        GAME_OVER
    */
    create(name) { //Add handling to cut out duplicates.
        return this.dao.run(
            `INSERT OR IGNORE INTO servers (players, words, usedwords,currentwords, skippedwords,name,score,guesser,team1,team2,state,correctwords,incorrectwords)
            VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)`,
            [JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), JSON.stringify(""), JSON.stringify([]), name, "0-0", "1-1", null, null, JSON.stringify("WAIT_FOR_PLAYERS"),JSON.stringify([]),JSON.stringify([])]);
    }
    join(playerID, serverID,ifFirstSetMaster) {
        let playerList = this.dao.get(
            `SELECT players FROM servers WHERE id = ?`,
            [serverID]).then(data => {
            if (data.players.length==2) {
                console.log("Setting Master...")
                ifFirstSetMaster();
            }
            // console.log(data, serverID, playerID)
            if (data.players == null) {
                let newList = [playerID];
                // console.log(newList + "  ");
                // console.log("SUCCESS");
                this.dao.run(`UPDATE servers SET players = ? WHERE id = ?`,
                    [JSON.stringify(newList), serverID]
                ).then(data => {
                    return data;
                });
            } else {
                // console.log(data.players + "NEW");
                let newdata = JSON.parse(data.players);
                
                console.log(newdata + "  x" + newdata.length + playerID)
                if (newdata.includes(playerID)) {
                    // console.log("AGAIN")
                    return -1;
                } else {
                    // console.log(newdata)
                    newdata.push(playerID);
                    // console.log(newdata)
                    this.dao.run(`UPDATE servers SET players = ? WHERE id = ?`,
                        [JSON.stringify(newdata), serverID]
                    ).then(data => {
                        return data
                    });
                };
            }
        });
        return -1;
    };
    reset(serverID,callback) {
        console.log("RESETING: " + serverID);
        this.dao.run(`UPDATE servers SET words = ?, usedwords = ?, currentwords = ?, skippedwords =?, score = ?, guesser =?, state=?, correctwords =?, incorrectwords = ?,players = ?, team1 =?, team2 = ? WHERE id = ?`,
                [JSON.stringify([]),JSON.stringify([]),JSON.stringify(""),JSON.stringify([]),"0-0","1-1",JSON.stringify("WAIT_FOR_PLAYERS"),JSON.stringify([]),JSON.stringify([]),JSON.stringify([]),null,null, serverID]
            ).then(data => {
                callback(serverID)
            });
    }
    addWords(serverID,newWords,pause) {
        function shuffle(array) {
            let currentIndex = array.length, temporaryValue, randomIndex;
          
            while (0 !== currentIndex) {
              randomIndex = Math.floor(Math.random() * currentIndex);
              currentIndex -= 1;
              temporaryValue = array[currentIndex];
              array[currentIndex] = array[randomIndex];
              array[randomIndex] = temporaryValue;
            }
          
            return array;
          }
        this.dao.get(
            `SELECT words,players FROM servers WHERE id = ?`,
            [serverID]).then(data => {
            let words = JSON.parse(data.words);
            let players=JSON.parse(data.players);
            for (let newword of JSON.parse(newWords)) {
                words.push(newword);
            }
            words=shuffle(words)
            this.dao.run(`UPDATE servers SET words = ? WHERE id = ?`,
                [JSON.stringify(words), serverID]
            ).then(data => {
                if (players.length*2 == words.length) {
                    console.log("Going to pause.")
                    pause(serverID)
                } 
                return data;
            });
        })
    }
    nextWord(id, callback=()=>{},nextword="absent") {
        let words = (this.dao.get(
            `SELECT words,usedwords,skippedwords,currentwords,correctwords,incorrectwords FROM servers WHERE id = ?`,
            [id])).then(data => {
            data = data;
            data.words = JSON.parse(data.words);
            data.correctwords=JSON.parse(data.correctwords);
            data.incorrectwords=JSON.parse(data.incorrectwords);
            data.usedwords = JSON.parse(data.usedwords);

            data.skippedwords = JSON.parse(data.skippedwords);
            data.currentwords = JSON.parse(data.currentwords);
            let wordCorrect=[]
            if (nextword===true) {
                data.correctwords.push(data.currentwords)
            } else if (nextword === false) {
                data.incorrectwords.push(data.currentwords)
            }
            if (data.currentwords != undefined && data.currentwords !=null) {
                if (nextword=="absent") {
                    data.usedwords.push(data.currentwords);
                }
                let found=false;
                for (let element of data.words) {
                    if (element!=data.currentwords||found==true) {
                        wordCorrect.push(element);
                    } else {
                        found=true;
                    }
                }
                data.words=wordCorrect;
            }
            if (data.words.length == 0) {
                if (data.skippedwords.length == 0) {
                    this.dao.run(`UPDATE servers SET words = ?, usedwords = ?, currentwords = ?, state = ?, incorrectwords = ?, correctwords = ? WHERE id = ?`,
                    [JSON.stringify(data.words), JSON.stringify(data.usedwords), JSON.stringify(data.currentwords), JSON.stringify("GAME_OVER"), JSON.stringify(data.incorrectwords), JSON.stringify(data.correctwords), id]
                     ).then(data => {
                        callback(id);
                     });
                    return null;
                } else {
                    //Set regular words to skipped words, skippedwords to 0, then continue to draw a random word from the words category. 
                    data.currentwords = data.skippedwords[Math.round(data.skippedwords.length * Math.random())];
                    while (data.currentwords==null) {
                        data.currentwords = data.skippedwords[Math.round(data.skippedwords.length * Math.random())];
                    }
                    this.dao.run(`UPDATE servers SET words = ?, skippedwords = ?,usedwords = ?, currentwords = ?, incorrectwords = ?, correctwords = ? WHERE id = ?`,
                        [JSON.stringify(data.skippedwords), JSON.stringify([]), JSON.stringify(data.usedwords), JSON.stringify(data.currentwords), JSON.stringify(data.incorrectwords), JSON.stringify(data.correctwords), id]
                    ).then(data => {
                                console.log(data.currentwords + "  CURRENT");
                                callback(id);
                    });
                }
            } else {
                data.currentwords = data.words[Math.floor(data.words.length * Math.random())];
                while (data.currentwords==null) {
                    console.error("wordsettingerr");
                    data.currentwords = data.words[Math.round(data.words.length * Math.random())];
                }
                console.log("The current word is " + data.currentwords);
                this.dao.run(`UPDATE servers SET words = ?, usedwords = ?, currentwords = ?, incorrectwords = ?, correctwords = ? WHERE id = ?`,
                    [JSON.stringify(data.words), JSON.stringify(data.usedwords), JSON.stringify(data.currentwords), JSON.stringify(data.incorrectwords), JSON.stringify(data.correctwords), id]
                ).then(data => {
                    callback(id);
                });
            }
        })
    }
    skipWord(id, callback, end = false) {
        //Move currentword to skippedwords array
        console.log("skipping")
        this.dao.get(
            `SELECT currentwords,skippedwords FROM servers WHERE id = ?`,
            [id]).then(data => {
            let word = data.currentwords;
            let skipped = JSON.parse(data.skippedwords);
            if (skipped == null) {
                skipped = [];
            }
            skipped.push(JSON.parse(word));
            console.log(skipped);
            this.dao.run(`UPDATE servers SET skippedwords = ? WHERE id = ?`,
                [JSON.stringify(skipped), id]
            ).then(() => {
                console.log("phase 2")
                 this.nextWord(id, callback,"absent");
            })

        });
        //Purge currentword
    }
    wordCorrect(id, callback) {
        this.dao.get(
            `SELECT state,score,guesser FROM servers WHERE id = ?`,
            [id]).then(data => {
            let score = data.score.split("-");
            let guesser = data.guesser.split("-");
            let state="";
            if (Number(guesser[0])>Number(guesser[1])) {
                guesser[1]=String(Number(guesser[1])+1);
                state="TEAM1_GUESS";
            } else {
                guesser[0]=String(Number(guesser[0])+1);
                state="TEAM2_GUESS";
            }
            if (state == "TEAM1_GUESS") {
                score[0] = Number(score[0]) + 1;
            } else {
                score[1] = Number(score[1]) + 1;
            }
            console.log("The current score is: " + score.join("-") + " " + state);
            let value = this.dao.run(`UPDATE servers SET score = ? WHERE id = ?`,
                [score.join("-"), id]
            ).then(() => {
                callback(id);
            })
        });
    }
    ready(serverID, callback) {
        this.dao.get(
            `SELECT state,guesser,score FROM servers WHERE id = ?`,
            [serverID]).then(data => {
                let state = JSON.parse(data.state);
                let guesser = data.guesser.split("-");
                if (Number(guesser[0])>Number(guesser[1])) {
                    guesser[1]=String(Number(guesser[1])+1);
                    state="TEAM2_GUESS";
                } else {
                    guesser[0]=String(Number(guesser[0])+1);
                    state="TEAM1_GUESS";
                }
                console.log(state,": "+ data.score);
            this.dao.run(`UPDATE servers SET state = ?,guesser = ? WHERE id = ?`,
                [JSON.stringify(state), guesser.join("-"), serverID]
            ).then(() => {
                callback(serverID);
            })
        })
    }
    makeTeams(serverID,callback) {
        this.dao.get(
            `SELECT players FROM servers WHERE id = ?`,
            [serverID]).then(data => {
            let players = JSON.parse(data.players);
            for (let i = 0; i < players.length; i++) {
                let random = Math.round(Math.random() * players.length);
                let temp = players[i];
                players[i] = players[random];
                players[random] = temp;
            }
            players=players.filter(function(e){return e}); 
            if (players.length % 2 == 0) {
                let first = players.slice(0, players.length / 2);
                first=first.filter(function(e){return e}); 
                let second = players.slice(players.length / 2);
                second=second.filter(function(e){return e}); 
                // console.log(first);
                this.dao.run(`UPDATE servers SET team1 = ?, team2 = ? WHERE id = ?`,
                    [JSON.stringify(first), JSON.stringify(second), serverID]
                ).then(data => {
                    callback(serverID);
                    return data
                });
            } else {
                let first = players.slice(0, Math.floor(players.length / 2));
                first=first.filter(function(e){return e}); 
                let second = players.slice(Math.floor(players.length / 2));
                second=second.filter(function(e){return e}); 
                this.dao.run(`UPDATE servers SET team1 = ?, team2 = ? WHERE id = ?`,
                    [JSON.stringify(first), JSON.stringify(second), serverID]
                ).then(data => {
                    callback(serverID);
                    return data
                });
            }
        })
    }
    goAdd(id,callback) {
        this.dao.run(`UPDATE servers SET state = ? WHERE id = ?`,
        [JSON.stringify("ADD_WORDS"), id]
        ).then(data => {
            callback(id)});
    }
    pause(id,callback) {
        console.log("PAUSING")
        this.dao.run(`UPDATE servers SET state = ? WHERE id = ?`,
        [JSON.stringify("PAUSE"), id]
        ).then(data => {
            callback(id)});
    }
    getAll() {
        return this.dao.run(
            `SELECT * FROM servers`,
        )
    }
    swapFalse(id,word,callback) {
        this.dao.get(
            `SELECT incorrectwords,correctwords,score,guesser FROM servers WHERE id = ?`,
            [id]).then(data => {
            let state;
            let score = data.score.split("-");
            let guesser= data.guesser.split("-");
            if (Number(guesser[0])<=Number(guesser[1])) {
                score[1]=Number(score[1])+1;
                state="TEAM2_GUESS";
            } else {
                score[0]=Number(score[0])+1;
                state="TEAM1_GUESS";
            }
            data.incorrectwords=JSON.parse(data.incorrectwords);
            data.correctwords=JSON.parse(data.correctwords);
            if (data.incorrectwords.indexOf(word)!=-1) {
                data.incorrectwords.splice(data.incorrectwords.indexOf(word),1);
                data.correctwords.push(word)
                
            } else {
                console.log(`${word} was not found.`)
                return;
            }
            this.dao.run(`UPDATE servers SET incorrectwords = ?, correctwords = ?,score = ? WHERE id = ?`,
                [JSON.stringify(data.incorrectwords), JSON.stringify(data.correctwords),score.join("-"), id]
            ).then(() => {
                console.log("Swapped (F/T)")
                console.log("SCORE_CHANGED" + score.join("-"));
                callback(id);
                //callback({"correctwords":data.correctwords,"incorrectwords":data.incorrectwords, "id":id},id);
            })
            
        });
    }
    swapTrue(id,word,callback) {
        this.dao.get(
            `SELECT incorrectwords,correctwords,score,guesser FROM servers WHERE id = ?`,
            [id]).then(data => {
            let state;
            let score=data.score.split("-");
            let guesser= data.guesser.split("-");
            if (Number(guesser[0])<=Number(guesser[1])) {
                score[1]=Number(score[1])-1;
                state="TEAM2_GUESS";
            } else {
                score[0]=Number(score[0])-1;
                state="TEAM1_GUESS";
            }
            data.incorrectwords=JSON.parse(data.incorrectwords);
            data.correctwords=JSON.parse(data.correctwords);
            if (data.correctwords.includes(word)) {
                data.correctwords.splice(data.correctwords.indexOf(word),1);
                data.incorrectwords.push(word)
            } else {
                console.log(`${word} was not found.`)
                return;
            }
            
            this.dao.run(`UPDATE servers SET incorrectwords = ?, correctwords = ?, score = ? WHERE id = ?`,
                [JSON.stringify(data.incorrectwords), JSON.stringify(data.correctwords),score.join("-"), id]
            ).then(() => {
                console.log("SCORE_CHANGED" + score.join("-"));
                console.log("Swapped (T/F)")
                callback(id);
                //callback({"correctwords":data.correctwords,"incorrectwords":data.incorrectwords, "id":id},id);
            })
            
        });
    }
    getMyServer(id, callback) {
        this.dao.get(
            `SELECT * FROM servers WHERE id = ?`, [id]
        ).then(data => {
            callback(data)
        });
    }
    getID(name, callback) {
        this.dao.get(
            `SELECT id FROM servers WHERE name= ?`, [name]).then(data => {
            console.log(data.id);
            callback(data.id);
        })
    }

}

module.exports = ServerRepository;