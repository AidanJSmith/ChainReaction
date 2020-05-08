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
        name TEXT)`
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
            `INSERT INTO servers (players, words, usedwords,currentwords, skippedwords,name,score,guesser,team1,team2,state)
            VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?)`,
            [JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), JSON.stringify(""), JSON.stringify([]), name, "0-0"], null, null, null, JSON.stringify("WAIT_FOR_PLAYERS"));
    }
    join(playerID, serverID) {
        let playerList = this.dao.get(
            `SELECT players FROM servers WHERE id = ?`,
            [serverID]).then(data => {
            // console.log(data, serverID, playerID)
            if (data.players == null) {
                let newList = [playerID];
                // console.log(newList + "  ");
                // console.log("SUCCESS");
                this.dao.run(`UPDATE servers SET players = ? WHERE id = ?`,
                    [JSON.stringify(newList), serverID]
                ).then(data => {
                    return data
                });
            } else {
                // console.log(data.players + "NEW");
                let newdata = JSON.parse(data.players);
                // console.log(newdata)
                if (playerID in newdata) {
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
    leave(playerID, serverID) {

    }
    addWord(word, serverID) {
        this.dao.get(
            `SELECT words FROM servers WHERE id = ?`,
            [serverID]).then(data => {
            let words = JSON.parse(data.words);
            words.push(word);
            this.dao.run(`UPDATE servers SET words = ? WHERE id = ?`,
                [JSON.stringify(words), serverID]
            ).then(data => {
                return data
            });
        })
    }
    nextWord(id,sendWord) {
        let words = (this.dao.get(
            `SELECT words,usedwords,skippedwords,currentwords FROM servers WHERE id = ?`,
            [id])).then (data => {
                data=data;
                data.words=JSON.parse(data.words);

                data.usedwords=JSON.parse(data.usedwords);
                
                data.skippedwords=JSON.parse(data.skippedwords);
                
                data.currentwords=JSON.parse(data.currentwords);
                if (data.currentwords!=null) {
                    data.usedwords.push(data.currentwords);
                    data.words.slice(data.words.indexOf(data.currentwords),1);
                }
                if (data.words.length==data.usedwords.length+data.skippedwords.length) {
                    if (data.skippedwords.length==0) {
                        console.log("WARNING NULL")
                        return null;
                    } else {
                        //Set regular words to skipped words, skippedwords to 0, then continue to draw a random word from the words category. 
                        data.currentwords=data.skippedwords[Math.round(data.skippedwords.length*Math.random())];
                        this.dao.run(`UPDATE servers SET words = ?, skippedwords = ?,usedwords = ?, currentwords = ? WHERE id = ?`,
                        [JSON.stringify(data.skippedwords),JSON.stringify([]),JSON.stringify(data.usedwords),JSON.stringify(data.currentwords),id]
                        ).then(data => {
                            this.dao.get(
                                `SELECT state FROM servers WHERE id = ?`,
                                [id]).then(data => {
                                    return sendWord(currentword,id,JSON.parse(data.state));
                                })
                        });
                    }
                } else {
                        data.currentwords=data.words[Math.round(data.words.length*Math.random())];
                        let currentword=data.currentwords;
                        this.dao.run(`UPDATE servers SET words = ?, usedwords = ?, currentwords = ? WHERE id = ?`,
                        [JSON.stringify(data.words),JSON.stringify(data.usedwords),JSON.stringify(data.currentwords),id]
                        ).then(data => {
                            this.dao.get(
                                `SELECT state FROM servers WHERE id = ?`,
                                [id]).then(data => {
                                    return sendWord(currentword,id,JSON.parse(data.state));
                                })
                        });
                }
            })
    }
    endGame(serverID) {
    }
    startGame(serverID) {
        
    }
    ready(serverID,callback) {
        this.dao.get(
            `SELECT state FROM servers WHERE id = ?`,
            [serverID]).then(data => {
            let state = JSON.parse(data.state);
            if (state=="TEAM1_GUESS") {
                state="TEAM2_GUESS";
            } else if (state=="TEAM2_GUESS") {
                state="TEAM1_GUESS";
            } else {
                state="TEAM1_GUESS";
                if (Math.random()>=.5) {
                    state="TEAM2_GUESS";
                }
            }
            let value=this.dao.run(`UPDATE servers SET state = ? WHERE id = ?`,
                [JSON.stringify(state), serverID]
            ).then(() => {
                callback(state);
            })
        })
    }
    endGuess(serverID) {

    }
    makeTeams(serverID) {
        this.dao.get(
            `SELECT players FROM servers WHERE id = ?`,
            [serverID]).then(data => {
            let players = JSON.parse(data.players);
            for (let i=0;i<players.length;i++) {
                let random=Math.round(Math.random()*players.length);
                let temp=players[i];
                players[i]=players[random];
                players[random]=temp;
            }
            if (players.length%2==0) {
                let first=players.slice(0,players.length/2);
                let second=players.slice(players.length/2);
                // console.log(first);
                this.dao.run(`UPDATE servers SET team1 = ?, team2 = ? WHERE id = ?`,
                [JSON.stringify(first),JSON.stringify(second), serverID]
                ).then(data => {
                    return data
                });
            } else {
                let first=players.slice(0,Math.floor(players.length/2));
                let second=players.slice(Math.floor(players.length/2));
                // console.log(first);
                this.dao.run(`UPDATE servers SET team1 = ?, team2 = ? WHERE id = ?`,
                [JSON.stringify(first),JSON.stringify(second), serverID]
                ).then(data => {
                    return data
                });
            }
        })
    }
    
    getWord(id) {
        
        

    }
    getAll() {
        return this.dao.run(
            `SELECT * FROM servers`,
        )
    }

}

module.exports = ServerRepository;