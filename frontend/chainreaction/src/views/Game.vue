<template>
  <!-- 
    To-Do:
      Prevent Buttons from being pressed multiple times.
      New Mode? Text Only?
      Show other team last word?
      Word Review At The End of Rounds (Possibly Some Control For that?)
      Server Garbage Collection (Every day at midnight, just dump database, probably + whenever game ends, reset db)
  -->
  <div class="home">
    <div v-if="master">
      <h3>You are the game master.</h3>
    </div>
    <div class="aligner" v-if="game == null">
      <v-col>
        <v-row>
          <div class="wrapper logo mx-auto">
            <h1 class="display-3 mx-auto font-weight-black logo">CHAIN REACTION</h1>
            <h3 class="display-1 mx-auto logo">v1.2</h3>
          </div>
        </v-row>
        <v-col cols="12" sm="6" md="3" class="mx-auto">
          <v-row>
            <v-col cols="12" sm="6" md="6" class="mx-auto">
              <v-text-field
                cl
                class="enter"
                label="Name"
                outlined
                v-model="myName"
                maxlength="20"
                :rules="[wordValidator]"
                v-on:keyup.13="join()"
              ></v-text-field>
            </v-col>
            <v-btn x-large depressed @click="join()" class="mx-auto">Join Game</v-btn>
          </v-row>
        </v-col>
      </v-col>
    </div>
    <div v-else-if="JSON.parse(game.state) == `WAIT_FOR_PLAYERS`">
      <div class="aligner-2">
        <v-col>
          <v-row>
            <div class="wrapper logo mx-auto">
              <h1 class="display-3 mx-auto font-weight-black logo">CHAIN REACTION</h1>
              <h3 class="display-1 mx-auto logo">v1.2</h3>
            </div>
          </v-row>
          <v-col cols="12" sm="6" md="3" class="mx-auto enter">
            <v-row>
              <v-btn x-large depressed @click="shuffle()" class="mtop mx-auto">Shuffle Teams</v-btn>
              <v-btn
                x-large
                v-if="master"
                depressed
                @click="goAdd()"
                class="mx-auto mtop"
              >Start Game</v-btn>
              <h2 v-else>Wait for the gamemaster to start the game.</h2>
            </v-row>
            <v-row>
              <div class="mx-auto">
                <br />
                <div class="db mediumScalar">Current players:</div>
                <b class="db mediumScalar">
                  {{
                  JSON.parse(game.players).join(", ")
                  }}
                </b>
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
              <h1 class="display-3 mx-auto font-weight-black logo">Enter a word.</h1>
              <h3 class="display-1 mx-auto logo">{{ wordsAdded }}/{{ wordsMax }}</h3>
            </div>
          </v-row>
          <v-row>
            <v-col cols="12" sm="3" md="4" class="mx-auto enter">
              <v-text-field
                cl
                class="wordBox"
                outlined
                label="Enter a Word"
                v-model="currentWordAdd"
                maxlength="50"
                :rules="[wordValidator]"
                v-on:keyup.13="pushNextWord()"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row class="mx-auto">
            <v-btn x-large depressed @click="pushNextWord()" class="mx-auto enter">SUBMIT WORD</v-btn>
          </v-row>
        </v-col>
      </div>
      <div class="aligner-2" v-else>
        <v-col>
          <v-row>
            <div class="wrapper logo mx-auto">
              <h1 class="display-4 mx-auto font-weight-black logo">Waiting for other players...</h1>
            </div>
          </v-row>
          <v-row>
            <v-btn
              x-large
              depressed
              v-if="master"
              @click="toGuessing()"
              class="mx-auto enter"
            >Everyone is Ready (Ask Verbally Before v2)</v-btn>
          </v-row>
        </v-col>
      </div>
    </div>
    <div
      v-else-if="
        JSON.parse(game.state) == `PAUSE` &&
          !(JSON.parse(game.words).length == 0)
      "
    >
      <div class="aligner-2">
        <v-col>
          <div class="aligner-1">
            <v-col>
              <v-row>
                <div class="wrapper logo mx-auto">
                  <h1 class="display-4 mx-auto logo">
                    Is everyone ready for the next round? Words left:
                    <b
                      class="font-weight-black"
                    >{{ JSON.parse(game.words).length }}</b>
                  </h1>
                  <h3 class="display-3 mx-auto logo">
                    Next Guesser:
                    <b class="font-weight-black">{{ nextGuesser }}</b>
                    <br />
                    Words used last round:
                    <b class="font-weight-black">{{ usedWordsCurrent.join(", ") }}</b>
                    <br />
                  </h3>
                  <!--
                  <h1 class="display-2 mx-auto font-weight-black logo">
                    (The skipped words will be shuffled in at the end. Skipped:
                    {{ JSON.parse(game.skippedwords).length }})
                  </h1>
                  -->
                </div>
              </v-row>
              <v-row v-if="master">
                <v-btn
                  x-large
                  depressed
                  @click="corrnext()"
                  class="mx-auto enter mtop"
                >Last word correct?</v-btn>
                <v-btn
                  x-large
                  depressed
                  @click="wrongnext()"
                  class="mx-auto enter mtop"
                >Last word incorrect?</v-btn>
                <v-btn
                  x-large
                  depressed
                  @click="guessPause()"
                  class="mx-auto enter mtop"
                >Next Team Gets Last word</v-btn>
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
                <h1
                  class="db mx-auto font-weight-black logo"
                >You are the guesser. Your teammates will give you clues. Please wait...</h1>
              </div>
            </v-row>
          </v-col>
        </div>
        <div v-else>
          <v-col>
            <v-row>
              <div class="wrapper logo mx-auto">
                <h3 class="db mx-auto">Cluegivers, start composing your sentence.</h3>
              </div>
            </v-row>
            <v-row>
              <div class="wrapper logo mx-auto">
                <h3 class="db-2 mx-auto">
                  Player Order: {{
                  membersInActiveTeam
                  .slice(
                  1 + membersInActiveTeam.indexOf(getActiveGuesser())
                  )
                  .concat(
                  membersInActiveTeam.slice(
                  0,
                  membersInActiveTeam.indexOf(getActiveGuesser())
                  )
                  )
                  .join(", ")
                  }}
                  <br />
                  <i>Guesser: {{getActiveGuesser()}}</i>
                </h3>
              </div>
            </v-row>
            <v-row class="mx=auto" v-if="String(membersInActiveTeam
                  .slice(
                  1 + membersInActiveTeam.indexOf(getActiveGuesser())
                  )
                  .concat(
                  membersInActiveTeam.slice(
                  0,
                  membersInActiveTeam.indexOf(getActiveGuesser())
                  )
                  )[0])==String(myName)">
              <v-row>
                <v-btn x-large depressed @click="wrong()" class="mx-auto bb">Skip!</v-btn>
              </v-row>
              <v-row>
                <v-btn x-large depressed @click="next()" class="mx-auto bb">Correct!</v-btn>
              </v-row>
              <v-row>
                <v-btn x-large depressed @click="wrong()" class="mx-auto bb">Incorrect!</v-btn>
              </v-row>
            </v-row>
          </v-col>
          <v-row>
            <div class="wrapper logo mx-auto">
              <h3 class="db-4 mx-auto font-weight-black" style="margin-top:10%">
                Word:
                <div class="highlight">{{ (game.currentwords) }}</div>
              </h3>
            </div>
          </v-row>
        </div>
      </div>
      <div v-else>
        <!-- Show the other team's active players + guesser -->
        <div class="aligner">
          <v-col>
            <v-row>
              <div class="wrapper logo mx-auto">
                <h1
                  class="display-4 mx-auto font-weight-black"
                >You are on the other team. Wait for other guessers.</h1>
                <br />
                <h2 class="display-3 mx-auto font-weight-black">
                  Team1: {{JSON.parse(game.team1).join(", ")}}
                  <br />
                  Team2: {{JSON.parse(game.team2).join(", ")}}
                </h2>
              </div>
            </v-row>
          </v-col>
        </div>
      </div>
    </div>
    <div
      v-else-if="
        JSON.parse(game.state) == `GAME_OVER` ||
          JSON.parse(game.words).length == 0
      "
    >
      <div class="aligner">
        <v-col>
          <v-row>
            <div class="wrapper logo mx-auto">
              <h1 class="display-3 mx-auto font-weight-black">Good Game!</h1>
            </div>
          </v-row>
          <v-row class="wrapper mx-auto">
            <h2 class="display-4 mx-auto">Final Score: {{ game.score }}</h2>
          </v-row>
          <v-row class="wrapper mx-auto">
            <div class="mx-auto" v-if="winner == 1">
              <h1
                class="display-3 mx-auto font-weight-black"
              >Congratulations: {{ JSON.parse(game.team1).join(",") }}</h1>
            </div>
            <div class="mx-auto" v-if="winner == 2">
              <h1
                class="display-3 mx-auto font-weight-black"
              >Congratulations: {{ JSON.parse(game.team2).join(",") }}</h1>
            </div>
            <div class="mx-auto" v-if="winner == 'tie'">
              <h1 class="display-3 mx-auto font-weight-black">It was a tie! Everyone is a winner.</h1>
            </div>
          </v-row>
        </v-col>
      </div>
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
      lastState: null,
      usedWordsLast:[""],
      usedWordsCurrent:[],
      myName: "",
      words: [],
      currentWordAdd: "",
      wordsAdded: 0,
      wordsMax: 2,
      master: false,
      id: -1,
      game: null
    };
  },
  mounted() {
    //Setup Websockets
    //s://chainreactionserver.herokuapp.com
    this.socket = new WebSocket(`ws://localhost:3000`);
    this.socket.onopen = async () => {
      console.log("SENDING ");
      let id = this.$route.params.id;
      this.socket.send(JSON.stringify({ type: "newGame", name: id }));
      //Get game ID
      this.socket.send(JSON.stringify({ type: "getIDbyName", name: id }));
      this.firstRun = false;
      setInterval(() => {
        this.socket.send(JSON.stringify({ type: "heartbeat", name: id }));
      }, 2000);
    };
    this.socket.onmessage = event => {
      let data = JSON.parse(event.data);
      switch (data.type) {
        case "updateID":
          this.id = data.id;
          break;
        case "becomeMaster":
          this.master = true;
          break;
        case "startup":
          console.log("Server online.");
          break;
        case "updateState":
          if (this.myName != "" && data.data.id == this.id) {
            if (JSON.parse(data.data.state)!="GAME_OVER") {
              this.game = data.data;
              console.log(data.data);
            }
            if (JSON.parse(data.data.state)=="TEAM2_GUESS"||JSON.parse(data.data.state)=="TEAM1_GUESS") {
              this.lastState=data.data.state;
            }
            if (JSON.parse(data.data.state)=="PAUSE") {
              //Get used words, Remove all in old array, leaving only new ones.
              this.usedWordsCurrent=JSON.parse(data.data.usedwords).filter(x=>{return !this.usedWordsLast.includes(x)})
              this.usedWordsLast=JSON.parse(data.data.usedwords);
            }
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
    wrongnext() {
      this.wrong();
      setTimeout(() => {
        this.guessPause();
      }, 2);
    },
    corrnext() {
      this.next();
      setTimeout(() => {
        this.guessPause();
      }, 2);
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
      let team1 = eval(this.game.team1);
      let team2 = eval(this.game.team2);
      if (JSON.parse(this.game.state) == "TEAM2_GUESS") {
        this.firstRun =
          team2[Number(this.game.guesser.split("-")[1]) % team2.length];
        return team2[Number(this.game.guesser.split("-")[1]) % team2.length];
      }

      this.firstRun =
        team1[Number(this.game.guesser.split("-")[0]) % team1.length];
      return team1[Number(this.game.guesser.split("-")[0]) % team1.length];
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
    },
    wordValidator: value => {
      let pattern = /[^0-9a-zA-Z\s.]/g;
      if (value == null) {
        return "";
      }
      if (pattern.test(value) == true) {
        return "Please remove any special characters.";
      }
      return true;
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
    winner() {
      let score = this.game.score;
      if (Number(score.split("-")[0]) > Number(score.split("-")[1])) {
        return 1;
      } else if (Number(score.split("-")[1]) > Number(score.split("-")[0])) {
        return 2;
      } else {
        return "tie";
      }
    },
    membersInActiveTeam() {
      if (JSON.parse(this.game.state) == `TEAM2_GUESS`) {
        return JSON.parse(this.game.team2);
      }
      return JSON.parse(this.game.team1);
    },
    membersInActiveTeamReverse() {
      if (JSON.parse(this.game.state) == `TEAM1_GUESS`) {
        return JSON.parse(this.game.team2);
      }
      return JSON.parse(this.game.team1);
    },
    nextGuesser() {
      let team2 = eval(this.game.team1);
      let team1 = eval(this.game.team2);
      console.log("GAME:")
      console.log(this.game);
      console.log(this.lastState);
      if (JSON.parse(this.lastState) == `TEAM2_GUESS`) {
        console.log("Team 1 predict")
        return team2[
          (Number(this.game.guesser.split("-")[1]) + 1) % team2.length
        ];
      }
      console.log("TEAM 2 PREDICT")
      return team1[
        (Number(this.game.guesser.split("-")[0])) % team1.length
      ];
    }
  }
};
</script>
<style lang="scss">
@mixin for-phone-only {
  @media (max-width: 599px) {
    @content;
  }
}
@mixin for-tablet-portrait-up {
  @media (min-width: 600px) {
    @content;
  }
}
@mixin for-tablet-landscape-up {
  @media (min-width: 900px) {
    @content;
  }
}
@mixin for-desktop-up {
  @media (min-width: 1200px) {
    @content;
  }
}
@mixin for-big-desktop-up {
  @media (min-width: 1800px) {
    @content;
  }
}
.db {
  display: inline-block;
  font-size: 4vw;
}
.db-2 {
  display: inline-block;
  font-size: 4.5vw;
}
.highlight {
  color: #f77c60;
  display: inline-block;
}
.db-4 {
  @include for-phone-only() {
    font-size: 12vw;
  }
  @include for-tablet-portrait-up() {
    font-size: 10vw;
  }
  @include for-tablet-landscape-up() {
    font-size: 8vw;
  }
  @include for-desktop-up() {
    font-size: 5vw;
  }
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
.mtop {
  margin-top: 10px;
}
.aligner-2 {
  display: flex;
  align-items: center;
  vertical-align: middle;
  transform: translateY(10vw);
  justify-content: center;
}
.enter {
  transform: scale(1.25) translateY(-10px);
  @include for-phone-only() {
    transform: scale(1);
  }
}
.smallScalar {
  font-size: 2.5vw;
  @include for-phone-only() {
    font-size: 6vw;
  }
}
.mediumScalar {
  font-size: 1.5vw;
  @include for-phone-only() {
    font-size: 8vw;
  }
}
.home {
  width: 100%;
  height: 100%;
  background: rgb(96, 247, 209);
}
</style>
