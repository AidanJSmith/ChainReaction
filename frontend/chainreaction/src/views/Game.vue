<template>
  <div class="home">
    <div class="aligner" v-if="!playerName">
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
            <v-col cols="12" sm="6" md="3" class="mx-auto enter">
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
    <div v-else>
      We need a ready button in the button right-hand corner, a list of joined players, a shuffle teams button, a title, and the lists of both teams.
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
      id:-1
    };
  },
  mounted() {
    //Setup Websockets
    this.socket = new WebSocket(`ws://localhost:8081`);
    this.socket.onopen = () => {
      console.log("SENDING ");
      let id = this.$route.params.id;
      this.socket.send(JSON.stringify({ type: "newGame", name: id }))
      //Get game ID
      this.socket.send(JSON.stringify({ type: "getIDbyName", name: id }));
      this.firstRun = false;
    }
    this.socket.onmessage = event => {
      let data=JSON.parse(event.data);
      console.log(data);
      switch(data.type) {
        case "updateID":
          this.id=data.id;
          break;
        case "startup":
          console.log("Server online.");
          break;
        default:
          console.log(event.state);
          console.log("NOT FOUND");
      }
    };
  },
  methods: {
    join() {
      if(this.id!=-1){
        this.socket.send(JSON.stringify({type:"signup",name:this.myName,id:this.id}));
        this.playerName=true;
      }
    }
  },
};
</script>
<style lang="scss">
.logo {
  margin-bottom: 3%;
  display: inline-block;
}

.aligner {
  display: flex;
  align-items: center;
  vertical-align: middle;
  transform: translateY(120%);
  justify-content: center;
}
.enter {
  transform: scale(1.25);
}
.home {
  width: 100%;
  height: 100%;
  background: rgb(96, 247, 209);
}
</style>
