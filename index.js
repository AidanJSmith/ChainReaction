const Promise = require('bluebird')
const AppDAO = require('./dao')
const ServerRepository = require('./server_repository')

async function main() {
  const dao = new AppDAO('./database.sqlite3')
  const serverrepo = new ServerRepository(dao)

  serverrepo.createTable()
    .then(() => serverrepo.create("horsePaste"))
    .then( async (data) => {
      console.log(data); //Get ID here
      let id=data.id;
      serverrepo.join("Aidan Smith",id);
      setTimeout(() => {serverrepo.join("Aidan Smith 2",id);},100);
      serverrepo.addWord("catfish",id);
      setTimeout(() => {serverrepo.addWord("rekt",id);},100);
      
    });
}

main()