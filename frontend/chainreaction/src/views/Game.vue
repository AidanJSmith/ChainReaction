<template>
  <div class="home">
    <div class="aligner" v-if="game == null">
      <v-col>
        <v-row>
          <div class="wrapper logo  mx-auto">
            <h1 class="display-3 mx-auto font-weight-black logo">
              CHAIN REACTION
            </h1>
            <h3 class="display-1 mx-auto logo">v.01</h3>
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
            <div class="wrapper logo  mx-auto">
              <h1 class="display-3 mx-auto font-weight-black logo">
                CHAIN REACTION
              </h1>
              <h3 class="display-1 mx-auto logo">v.01</h3>
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
      <div class="aligner-2" v-if="wordsAdded<wordsMax"> 
        <v-col>
          <v-row>
            <div class="wrapper logo  mx-auto">
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
            <div class="wrapper logo  mx-auto">
              <h1 class="display-4 mx-auto font-weight-black logo">
                Waiting for other players...
              </h1>
            </div>
          </v-row>
          <v-row>
            <v-btn
              x-large
              depressed
              @click="toGuessing()"
              class="mx-auto enter"
              >Everybody Ready</v-btn
            >
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
      myName: "",
      words: [],
      currentWordAdd: "",
      wordsAdded: 0,
      wordsMax: 7,
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
      switch (data.type) {
        case "updateID":
          this.id = data.id;
          break;
        case "startup":
          console.log("Server online.");
          break;
        case "updateState":
          this.game = data.data;
          break;
        default:
          console.log(event.state);
          console.log("NOT FOUND");
      }
    };
  },
  methods: {
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
  }
};
</script>
<style lang="scss">
.db {
  display: inline-block;
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
