# Chain Reaction Online

## Description

This is an online game built on Express, Websockets, Vue, Sqlite, Heroku, and Node.js. It was designed and written entirely within two days\* (save for modifications to allow for hosting), leading to multiple dubious coding habits. Chain Reaction, a game popular among my family and our family friends translates notoriously poorly over an internet connection due to the variety of shared information. In order to compensate for that, I gave myself a two day\* mini challenge to write this platform as quickly as possible. I'd like to reiterate that this is *not* final code, and although it does work well and can handle a variety of clients and servers in a plethora of cases, there are bound to be others I simply couldn't catch in my limited coding period. If you don't already know how to play Chain Reaction, this isn't designed with you in mind, but if you'd like to learn, feel free to email me. The current client (with the bare minimum CSS styling to keep it looking somewhat modern and mobile compliant) can be found [here](https://chainreaction-994c5.web.app/#/).

All of this code was written from scratch and is free and open to the public for personal or commercial use.

\* The bulk of the actual coding was done in this time period.  This very well may have changed since the current release, too.

## Running on Your Machine

Simply cd into the server directory and:

```shell
node server.js
```

This file was designed with compatibility for heroku in mind, but will default to port 3000 if not hosted on a dyno. See the DAO for further details on database implementations and asynchronicity.

Want to run or modify the frontend? Just cd into the frontend/chainreaction  and

```shell
npm run serve
```
