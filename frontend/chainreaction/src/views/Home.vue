<template>
  <div class="home">
    <div class="aligner">
      <v-col>
        <v-row>
          <div class="wrapper logo  mx-auto">
            <h1 class="display-3 mx-auto font-weight-black logo">
              CHAIN REACTION
            </h1>
            <h3 class="display-1 mx-auto logo">v2.0</h3>
          </div>
        </v-row>
        <v-row>
          <router-link class="mx-auto" :to="{ name: 'host' }">
            <v-btn x-large depressed class="mx-auto">Join a game</v-btn>
          </router-link>
        </v-row>
        <v-row style="transform:translateY(10%)">
          <router-link class="mx-auto" :to="{ name: 'host' }">
            <v-btn x-large depressed>Host a game</v-btn>
          </router-link>
        </v-row>
      </v-col>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  mounted() {
    const userRegExample = {
      type: "signup",
      name: "ssss",
      id: "1"
    };
    console.log(userRegExample);
    // this.$connect();
    // this.$store.dispatch({type : 'sendMessage',  data : JSON.stringify(userRegExample)});
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

.home {
  width: 100%;
  height: 100%;
  background: rgb(96, 247, 209);
}
</style>
