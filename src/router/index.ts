import { createRouter, createWebHashHistory } from "vue-router"
import type  { RouteRecordRaw } from "vue-router"
import Home from "@/views/Home.vue"

const DEFAULT_ROUTE_CHILDREN: RouteRecordRaw[] = [{
  path: "/designer",
  name: "Designer",
  component: () => import("@/pages/designer/Index.vue")
}]

const DEFAULT_ROUTE: RouteRecordRaw = {
  path: "/",
  name: "home",
  component: Home,
  children: DEFAULT_ROUTE_CHILDREN,
  redirect: "/designer"
}

const routes: RouteRecordRaw[] = [
  DEFAULT_ROUTE
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})