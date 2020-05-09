<template>
  <div class="home">
    <div class="aligner">
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
          <v-text-field
            class="enter"
            label="Enter A Name"
            outlined
            v-model="serverName"
            :rules="[nameValidator]"
            maxlength="20"
          ></v-text-field>
          <v-row>
            <v-btn x-large depressed @click="createGame()" class="mx-auto"
              >Create Game</v-btn
            >
          </v-row>
        </v-col>
      </v-col>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Game",
  data() {
    return {
      serverName: null
    };
  },
  methods: {
    nameValidator: value => {
      let pattern = /[^0-9a-zA-Z]/g;
      if (value == null) {
        return "";
      }
      if (pattern.test(value) == true) {
        console.log("EE");
        return "Please remove whitespace and special characters.";
      }
      console.log(value);
      return true;
    },
    createGame() {
      this.$router.push(`/game/${this.serverName}`);
    }
  }
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
