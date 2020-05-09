import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Host from "../views/Host.vue";
import Game from "../views/Game.vue";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/game/:id",
    name: "Game",
    component: Game
  },
  {
    path: "/host",
    name: "host",
    component: Host
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
