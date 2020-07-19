<template>
  <v-app>
    <v-content class="bkg">
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    socket: ""
  })
};
</script>
<style lang="scss">
.bkg {
  background: rgb(96, 247, 209);
}
</style>
