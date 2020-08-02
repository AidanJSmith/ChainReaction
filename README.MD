# Chain Reaction Online

## Description

This is an online game built on Express, Websockets, Vue, Sqlite, Heroku, and Node.js. It's recently gone through a partial rewrite and  been adapted to be better scalable and to have less problematic bugs. The hosting has diverged from firebase and heroku to just the latter, so running it locally is simpler now too. This party game was a great deal of fun with my family friends, so I adapted it to better fit the world during the pandemic. There may still be a few bugs, but it's largely functional now.

All of this code was written from scratch and is free and open to the public for personal or commercial use.


## Running on Your Machine

Simply cd into the server directory and:

```shell
node server.js
```

This file was designed with compatibility for heroku in mind, but will default to port 3000 if not hosted on a dyno. See the DAO for further details on database implementations and asynchronicity. It hosts an HTTP server and Websocket client by default.

Want to run or modify the frontend? Just cd into the frontend/chainreaction, build it when you're done, and move it to the hosting directory.

```shell
npm run serve
```
