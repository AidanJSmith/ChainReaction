<template>
  <div class="home">
    <div class="aligner" v-if="game == null">
      <v-col>
        <v-row>
          <div class="wrapper logo mx-auto">
            <h1 class="display-3 mx-auto font-weight-black logo">
              CHAIN REACTION
            </h1>
            <h3 class="display-1 mx-auto logo">v1.03</h3>
          </div>
        </v-row>
        <v-col cols="12" sm="6" md="3" class="mx-auto enter">
          <v-row>
            <v-col cols="2" sm="3" md="4" class="mx-auto enter">
              <v-text-field
                cl
                class="enter"
                label="Name"
                outlined
                v-model="myName"
                maxlength="20"
              ></v-text-field>
            </v-col>
            <v-btn x-large depressed @click="join()" class="mx-auto"
              >Join Game</v-btn
            >
          </v-row>
        </v-col>
      </v-col>
    </div>
    <div v-else-if="JSON.parse(game.state) == `WAIT_FOR_PLAYERS`">
      <div class="aligner-2">
        <v-col>
          <v-row>
            <div class="wrapper logo mx-auto">
              <h1 class="display-3 mx-auto font-weight-black logo">
                CHAIN REACTION
              </h1>
              <h3 class="display-1 mx-auto logo">v1.03</h3>
            </div>
          </v-row>
          <v-col cols="12" sm="6" md="3" class="mx-auto enter">
            <v-row>
              <v-btn x-large depressed @click="shuffle()" class="mx-auto"
                >Shuffle Teams</v-btn
              >
              <v-btn x-large depressed @click="goAdd()" class="mx-auto"
                >START GAME (global)</v-btn
              >
            </v-row>
            <v-row>
              <div class="mx-auto">
                <br />
                <div class="db mediumScalar">Current players:</div>
                <b class="db mediumScalar">{{
                  JSON.parse(game.players).join(", ")
                }}</b>
              </div>
            </v-row>
            <v-row>
              <div class="mx-auto">
                <v-row cols="2" sm="1" md="3">
                  <v-col>
                    <div class="smallScalar">
                      Team 1:
                      {{
                        game.team1 != null
                          ? JSON.parse(game.team1).join(", ")
                          : "loading"
                      }}
                    </div>
                  </v-col>
                  <v-col>
                    <div class="smallScalar">
                      Team 2:
                      {{
                        game.team1 != null
                          ? JSON.parse(game.team2).join(", ")
                          : "loading"
                      }}
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-row>
          </v-col>
        </v-col>
      </div>
    </div>
    <div v-else-if="JSON.parse(game.state) == `ADD_WORDS`">
      <div class="aligner-2" v-if="wordsAdded < wordsMax">
        <v-col>
          <v-row>
            <div class="wrapper logo mx-auto">
              <h1 class="display-3 mx-auto font-weight-black logo">
                Enter a word.
              </h1>
              <h3 class="display-1 mx-auto logo">
                {{ wordsAdded }}/{{ wordsMax }}
              </h3>
            </div>
          </v-row>
          <v-row>
            <v-col cols="12" sm="3" md="4" class="mx-auto enter">
              <v-text-field
                cl
                class="wordBox"
                outlined
                v-model="currentWordAdd"
                maxlength="50"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row class="mx-auto">
            <v-btn
              x-large
              depressed
              @click="pushNextWord()"
              class="mx-auto enter"
              >SUBMIT WORD</v-btn
            >
          </v-row>
        </v-col>
      </div>
      <div class="aligner-2" v-else>
        <v-col>
          <v-row>
            <div class="wrapper logo mx-auto">
              <h1 class="display-4 mx-auto font-weight-black logo">
                Waiting for other players...
              </h1>
            </div>
          </v-row>
          <v-row>
            <v-btn x-large depressed @click="toGuessing()" class="mx-auto enter"
              >Everybody Ready</v-btn
            >
          </v-row>
        </v-col>
      </div>
    </div>
    <div v-else-if="JSON.parse(game.state) == `PAUSE`&&!(JSON.parse(game.words).length==0)">
      <div class="aligner-2">
        <v-col>
          <div class="aligner-1">
            <v-col>
              <v-row>
                <div class="wrapper logo mx-auto">
                  <h1 class="display-4 mx-auto font-weight-black logo">
                     Is everyone ready for the next round? Words left: {{JSON.parse((game.words)).length}}
                  </h1>
                  <h1 class="display-2 mx-auto font-weight-black logo">
                     (The skipped words will be shuffled in at the end. Skipped: {{JSON.parse(game.skippedwords).length}})
                  </h1>
                </div>
              </v-row>
              <v-row>
                 <v-btn x-large depressed @click="next()" class="mx-auto enter"
                  >Did they get the last word?</v-btn
                >
                <v-btn x-large depressed @click="guessPause()" class="mx-auto enter"
                  >Everybody Ready</v-btn
                >
              </v-row>
            </v-col>
          </div>
        </v-col>
        </div>
    </div>
    <div
      v-else-if="
        JSON.parse(game.state) == `TEAM2_GUESS` ||
          JSON.parse(game.state) == `TEAM1_GUESS`
      "
    >
      <div v-if="inActiveTeam">
        <!-- Show the members of your team, and your place in the speaking order. If you're the guesser, don't show the word, otherwise, do.-->
        <div v-if="String(getActiveGuesser()) == String(myName)">
          <v-col>
            <v-row>
              <div class="wrapper logo mx-auto">
                <h1 class="display-4 mx-auto font-weight-black logo">
                  You are the active guesser. Good Luck.
                </h1>
                <h3 class="display-1 mx-auto logo">🍀</h3>
              </div>
            </v-row>
          </v-col>
        </div>
        <div v-else>
          <v-col>
            <v-row>
              <div class="wrapper logo mx-auto">
                <h3
                  class="db mx-auto font-weight-black display-3"
                  v-for="member in (membersInActiveTeam).slice(1+membersInActiveTeam.indexOf(getActiveGuesser)).concat((membersInActiveTeam).slice(0,membersInActiveTeam.indexOf(getActiveGuesser)))"
                  :key="member"
                >
                  {{ member }},
                </h3>
              </div>
            </v-row>
            <v-row class="mx=auto">
              <v-row>
                <v-btn x-large depressed @click="skip()" class="mx-auto bb"
                  >Skip!</v-btn
                >
              </v-row>
              <v-row>
                <v-btn x-large depressed @click="next()" class="mx-auto bb"
                  >Correct!</v-btn
                >
              </v-row>
              <v-row>
                <v-btn x-large depressed @click="wrong()" class="mx-auto bb"
                  >Incorrect!</v-btn
                >
              </v-row>
            </v-row>
          </v-col>
          <v-row>
            <div class="wrapper logo mx-auto">
              <h3 class="db mx-auto font-weight-black display-4">
                Word:{{ game.currentwords }}
              </h3>
            </div>
          </v-row>
        </div>
      </div>
      <div v-else>
        <!-- Show the other team's active players + guesser -->
         <div class="aligner" v-if="game == null">
            <v-col>
              <v-row>
                <div class="wrapper logo mx-auto">
                  <h1 class="display-4 mx-auto font-weight-black">
                    You are on the other team. Please be patient!
                  </h1>
                  <h3 class="display-1 mx-auto logo">🕰️</h3>
                </div>
              </v-row>
            </v-col>
          </div>
      </div>
    </div>
    <div
      v-else-if="JSON.parse(game.state) == `GAME_OVER`||JSON.parse(game.words).length==0">
      Good game. {{game.score}}I need more styles here... {{game.team1}}||{{game.team2}}

    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Game",
  data() {
    return {
      socket: "",
      lastMessage: "",
      firstRun: true,
      playerName: false,
      myName: "",
      words: [],
      currentWordAdd: "",
      wordsAdded: 0,
      wordsMax: 1,
      id: -1,
      game: null
    };
  },
  mounted() {
    //Setup Websockets
    this.socket = new WebSocket(`ws://localhost:8081`);
    this.socket.onopen = async () => {
      console.log("SENDING ");
      let id = this.$route.params.id;
      this.socket.send(JSON.stringify({ type: "newGame", name: id }));
      //Get game ID
      this.socket.send(JSON.stringify({ type: "getIDbyName", name: id }));
      this.firstRun = false;
    };
    this.socket.onmessage = event => {
      let data = JSON.parse(event.data);
      console.log(data);
      switch (data.type) {
        case "updateID":
          this.id = data.id;
          break;
        case "startup":
          console.log("Server online.");
          break;
        case "updateState":
          if (this.myName != "") {
            this.game = data.data;
          }
          break;
        default:
          console.log(event.state);
          console.log("NOT FOUND");
      }
    };
  },
  methods: {
    skip() {
      this.socket.send(
        JSON.stringify({
          type: "skipWord",
          id: this.id
        })
      );
    },
    next() {
      this.socket.send(
        JSON.stringify({
          type: "wordCorrect",
          id: this.id
        })
      );
    },
    wrong() {
      this.socket.send(
        JSON.stringify({
          type: "wordIncorrect",
          id: this.id
        })
      );
    },
     guessPause() {
      this.socket.send(
        JSON.stringify({
          type: "readyPause",
          id: this.id,
          words: JSON.stringify(this.words)
        })
      );
      console.log("Sent unpause.");
    },
    toGuessing() {
      this.socket.send(
        JSON.stringify({
          type: "ready",
          id: this.id,
          words: JSON.stringify(this.words)
        })
      );
    },
    pushNextWord() {
      this.words.push(this.currentWordAdd);
      this.currentWordAdd = "";
      this.wordsAdded++;
      if (this.wordsAdded == this.wordsMax) {
        this.socket.send(
          JSON.stringify({
            type: "addWords",
            id: this.id,
            words: JSON.stringify(this.words)
          })
        );
      }
    },
    getActiveGuesser() {
      this.game.team2 = JSON.stringify(
        JSON.parse(this.game.team2)
          .join("^^^")
          .split("^^^")
      );
      this.game.team1 = JSON.stringify(
        JSON.parse(this.game.team1)
          .join("^^^")
          .split("^^^")
      );

      if (JSON.parse(this.game.state) == "TEAM2_GUESS") {
        console.log(
          JSON.parse(this.game.team2)[
            this.game.team2.length % Number(this.game.guesser.split("-")[1])
          ]
        );
        this.firstRun = JSON.parse(this.game.team2)[
          this.game.team2.length % Number(this.game.guesser.split("-")[1])
        ];
        return JSON.parse(this.game.team2)[
          this.game.team2.length % Number(this.game.guesser.split("-")[1])
        ];
      }
      this.firstRun = JSON.parse(this.game.team1)[
        this.game.team1.length % Number(this.game.guesser.split("-")[0])
      ];
      return JSON.parse(this.game.team1)[
        this.game.team1.length % Number(this.game.guesser.split("-")[0])
      ];
    },
    goAdd() {
      this.socket.send(JSON.stringify({ type: "goAdd", id: this.id }));
    },
    shuffle() {
      this.socket.send(JSON.stringify({ type: "switchTeams", id: this.id }));
    },
    join() {
      if (this.id != -1) {
        this.socket.send(
          JSON.stringify({ type: "signup", name: this.myName, id: this.id })
        );
        this.playerName = true;
        console.log("Getting data...");
        setTimeout(() => {
          this.socket.send(
            JSON.stringify({ type: "switchTeams", id: this.id })
          );
        }, 200);
      }
    }
  },
  computed: {
    inActiveTeam() {
      if (JSON.parse(this.game.state) == `TEAM2_GUESS`) {
        if (JSON.parse(this.game.team2).includes(this.myName)) {
          return true;
        }
        return false;
      }
      if (JSON.parse(this.game.team1).includes(this.myName)) {
        return true;
      }
      return false;
    },
    membersInActiveTeam() {
      if (JSON.parse(this.game.state) == `TEAM2_GUESS`) {
        return JSON.parse(this.game.team2);
      }
      return JSON.parse(this.game.team1);
    }
  }
};
</script>
<style lang="scss">
.db {
  display: inline-block;
}
.bb {
  width: 80%;
}
.logo {
  margin-bottom: 3%;
  display: inline-block;
}

.aligner {
  display: flex;
  align-items: center;
  vertical-align: middle;
  transform: translateY(10vw);
  justify-content: center;
}

.aligner-2 {
  display: flex;
  align-items: center;
  vertical-align: middle;
  transform: translateY(10vw);
  justify-content: center;
}
.enter {
  transform: scale(1.25);
}
.smallScalar {
  font-size: 2vw;
}
.mediumScalar {
  font-size: 1.5vw;
}
.home {
  width: 100%;
  height: 100%;
  background: rgb(96, 247, 209);
}
</style>
