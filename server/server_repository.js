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
            `INSERT OR IGNORE INTO servers (players, words, usedwords,currentwords, skippedwords,name,score,guesser,team1,team2,state)
            VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?)`,
            [JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), JSON.stringify(""), JSON.stringify([]), name, "0-0", "1-1", null, null, JSON.stringify("WAIT_FOR_PLAYERS")]);
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
    leave(playerID, serverID) {

    }
    addWords(serverID,newWords) {
        this.dao.get(
            `SELECT words FROM servers WHERE id = ?`,
            [serverID]).then(data => {
            let words = JSON.parse(data.words);
            for (let newword of JSON.parse(newWords)) {
                words.push(newword);
            }
            this.dao.run(`UPDATE servers SET words = ? WHERE id = ?`,
                [JSON.stringify(words), serverID]
            ).then(data => {
                return data
            });
        })
    }
    nextWord(id, sendWord) {
        let words = (this.dao.get(
            `SELECT words,usedwords,skippedwords,currentwords FROM servers WHERE id = ?`,
            [id])).then(data => {
            data = data;
            data.words = JSON.parse(data.words);

            data.usedwords = JSON.parse(data.usedwords);

            data.skippedwords = JSON.parse(data.skippedwords);

            data.currentwords = JSON.parse(data.currentwords);
            if (data.currentwords != null) {
                data.usedwords.push(data.currentwords);
                data.words.slice(data.words.indexOf(data.currentwords), 1);
            }
            console.log(data.words,data.words.length,data.usedwords,data.usedwords.length,data.skippedwords,data.skippedwords.length)

            if (data.words.length == 0) {
                if (data.skippedwords.length == 0) {
                    console.log("WARNING NULL")
                    this.dao.run(`UPDATE servers SET words = ?, usedwords = ?, currentwords = ? WHERE id = ?`,
                    [JSON.stringify(data.words), JSON.stringify(data.usedwords), JSON.stringify(data.currentwords), id]
                     ).then(data => {
                        sendWord();
                     });
                    return null;
                } else {
                    //Set regular words to skipped words, skippedwords to 0, then continue to draw a random word from the words category. 
                    data.currentwords = data.skippedwords[Math.round(data.skippedwords.length * Math.random())];
                    this.dao.run(`UPDATE servers SET words = ?, skippedwords = ?,usedwords = ?, currentwords = ? WHERE id = ?`,
                        [JSON.stringify(data.skippedwords), JSON.stringify([]), JSON.stringify(data.usedwords), JSON.stringify(data.currentwords), id]
                    ).then(data => {
                                console.log(currentword + "  CURRENT");
                                sendWord();
                    });
                }
            } else {
                data.currentwords = data.words[Math.round(data.words.length * Math.random())];
                let currentword = data.currentwords;
                this.dao.run(`UPDATE servers SET words = ?, usedwords = ?, currentwords = ? WHERE id = ?`,
                    [JSON.stringify(data.words), JSON.stringify(data.usedwords), JSON.stringify(data.currentwords), id]
                ).then(data => {
                    sendWord();
                });
            }
        })
    }
    skipWord(id, callback, end = false) {
        //Move currentword to skippedwords array
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
            this.dao.run(`UPDATE servers SET currentwords = ?,skippedwords = ? WHERE id = ?`,
                [null, JSON.stringify(skipped), id]
            ).then(() => {
                if (!end)
                    this.nextWord(id, callback);
            })

        });
        //Purge currentword
    }
    endGame(serverID) {}
    startGame(serverID) {

    }
    wordCorrect(id, callback) {
        this.dao.get(
            `SELECT state,score FROM servers WHERE id = ?`,
            [id]).then(data => {
            console.log(data);
            let score = data.score.split("-");
            if (JSON.parse(data.state) == "TEAM1_GUESS") {
                score[0] = Number(score[0]) + 1;
            } else {
                score[1] = Number(score[1]) + 1;
            }
            let value = this.dao.run(`UPDATE servers SET score = ? WHERE id = ?`,
                [score.join("-"), id]
            ).then(() => {
                callback();
            })
        });
    }
    ready(serverID, sallback) {
        this.dao.get(
            `SELECT state,guesser FROM servers WHERE id = ?`,
            [serverID]).then(data => {
            let state = JSON.parse(data.state);
            let score = data.guesser.split("-");
            if (state == "TEAM1_GUESS") {
                state = "TEAM2_GUESS";
                score[0] = Number(score[0]) + 1;
            } else if (state == "TEAM2_GUESS") {
                state = "TEAM1_GUESS";
                score[1] = Number(score[1]) + 1;
            } else {
                state = "TEAM1_GUESS";
                score[0] = Number(score[0]) + 1;
                if (Math.random() >= .5) {
                    state = "TEAM2_GUESS";
                    score[1] = Number(score[1]) + 1;
                }
            }
            let value = this.dao.run(`UPDATE servers SET state = ?,guesser = ? WHERE id = ?`,
                [JSON.stringify(state), score.join("-"), serverID]
            ).then(() => {
                sallback();
            })
        })
    }

    makeTeams(serverID,recallback) {
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
            if (players.length % 2 == 0) {
                let first = players.slice(0, players.length / 2);
                let second = players.slice(players.length / 2);
                // console.log(first);
                this.dao.run(`UPDATE servers SET team1 = ?, team2 = ? WHERE id = ?`,
                    [JSON.stringify(first), JSON.stringify(second), serverID]
                ).then(data => {
                    recallback();
                    return data
                });
            } else {
                let first = players.slice(0, Math.floor(players.length / 2));
                let second = players.slice(Math.floor(players.length / 2));
                console.log(first);
                this.dao.run(`UPDATE servers SET team1 = ?, team2 = ? WHERE id = ?`,
                    [JSON.stringify(first), JSON.stringify(second), serverID]
                ).then(data => {
                    recallback();
                    return data
                });
            }
        })
    }
    goAdd(id,precallback) {
        this.dao.run(`UPDATE servers SET state = ? WHERE id = ?`,
        [JSON.stringify("ADD_WORDS"), id]
        ).then(data => {
            precallback(data)});
    }
    pause(id,precallback) {
        this.dao.run(`UPDATE servers SET state = ? WHERE id = ?`,
        [JSON.stringify("PAUSE"), id]
        ).then(data => {
            precallback(data)});
    }
    getAll() {
        return this.dao.run(
            `SELECT * FROM servers`,
        )
    }
    getMyServer(id, callback) {
        this.dao.get(
            `SELECT * FROM servers WHERE id = ?`, [id]
        ).then(data => {
            callback(data)
        });
    }
    getID(name, extraFunc) {
        this.dao.get(
            `SELECT id FROM servers WHERE name= ?`, [name]).then(data => {
            console.log(data.id);
            extraFunc(data.id);
        })
    }

}

module.exports = ServerRepository;