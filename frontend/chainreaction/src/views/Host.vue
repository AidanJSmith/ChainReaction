<template>
  <div class="home">
    <div class="aligner">
      <v-col>
        <v-row>
          <div class="wrapper logo  mx-auto">
            <h1 class="display-3 mx-auto font-weight-black logo">
              CHAIN REACTION
            </h1>
            <h3 class="display-1 mx-auto logo">v1.2</h3>
          </div>
        </v-row>
        <v-col cols="12" sm="6" md="3" class="mx-auto">
          <v-text-field
            class="enter"
            label="Game Name"
            outlined
            v-model="serverName"
            :rules="[nameValidator]"
            maxlength="20"
          ></v-text-field>
          <v-row>
            <v-btn x-large depressed @click="createGame()" class="mx-auto"
              >Enter Game</v-btn
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
        return "Please remove whitespace and special characters.";
      }
      return true;
    },
    createGame() {
      this.$router.push(`/game/${this.serverName}`);
    }
  }
};
</script>
<style lang="scss">

@mixin for-phone-only {
  @media (max-width: 599px) { @content; }
}
@mixin for-tablet-portrait-up {
  @media (min-width: 600px) { @content; }
}
@mixin for-tablet-landscape-up {
  @media (min-width: 900px) { @content; }
}
@mixin for-desktop-up {
  @media (min-width: 1200px) { @content; }
}
@mixin for-big-desktop-up {
  @media (min-width: 1800px) { @content; }
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
.enter {
  transform: scale(1);
  @include for-phone-only() {
      transform: 1;
  }
}
.home {
  width: 100%;
  height: 100%;
  background: rgb(96, 247, 209);
}

</style>
