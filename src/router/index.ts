import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import ListPage from "../views/ListPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: ListPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
