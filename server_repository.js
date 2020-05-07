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
        name TEXT)`
      return this.dao.run(sql)
    }
    create(name) { //Add handling to cut out duplicates.
        return this.dao.run(
          `INSERT INTO servers (players, words, usedwords, skippedwords,name,score)
            VALUES (?, ?, ?, ?, ?, ?)`,
          [JSON.stringify([]),JSON.stringify([]),JSON.stringify([]),JSON.stringify([]),name,"0-0"]);
      }
    join(playerID,serverID) {
        let playerList=this.dao.get(
            `SELECT players FROM servers WHERE id = ?`,
            [serverID]).then( data => {
                console.log(data,serverID,playerID)
                if (data.players==null) {
                    let newList=[playerID];
                    console.log(newList+"  ");
                    console.log("SUCCESS");
                    this.dao.run(`UPDATE servers SET players = ? WHERE id = ?`,
                        [JSON.stringify(newList), serverID]
                    ).then(data=> {return data});
                }
                else {
                    console.log(data.players + "NEW");
                    let newdata = JSON.parse(data.players);
                    console.log(newdata)
                    if (playerID in newdata) {
                        console.log("AGAIN")
                        return -1;
                    } else {
                        console.log(newdata)
                        newdata.push(playerID);
                        console.log(newdata)
                        this.dao.run(`UPDATE servers SET players = ? WHERE id = ?`,
                            [JSON.stringify(newdata), serverID]
                        ).then(data=> {return data});
                    };
                }});
                return -1;       
    };
    leave(playerID,serverID) {

    }
    addWord(word,serverID) {
        this.dao.get(
            `SELECT words FROM servers WHERE id = ?`,
            [serverID]).then(data => {
                let words=JSON.parse(data.words);
                console.log(words);
               
                words.push(word);
                console.log("words " + words);
                this.dao.run(`UPDATE servers SET words = ? WHERE id = ?`,
                            [JSON.stringify(words), serverID]
                        ).then(data=> {return data});
            })
    }
    closeServer(serverID) {

    }
    getWord(id) {
        let words = JSON.parse(this.dao.get(
            `SELECT words FROM servers WHERE id = ?`,
            [id]))
        let skipped = JSON.parse(this.dao.get(
            `SELECT skippedwords FROM servers WHERE id = ?`,
            [id]))
        let used = JSON.parse(this.dao.get(
            `SELECT usedwords FROM servers WHERE id = ?`,
            [id]))
        console.log(words,skipped,used);

    }
    getAll() {
        return this.dao.run(
            `SELECT * FROM servers`,
        )
    }

  }
  
  module.exports = ServerRepository;