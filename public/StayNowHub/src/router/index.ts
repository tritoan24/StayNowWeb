import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import StayNowHub from '@/components/StayNowHub.vue';
import SideLogin from '@/views/authentication/SideLogin.vue';
import Contact from '@/views/Contact.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/staynow',
    name: 'StayNowHub',
    component: StayNowHub,
    children: [
    
      {
        path: '/home',
        name: 'HomePage',
        component: HomePage
      },
      {
        path: '/contact',
        name: 'Contact',
        component: Contact
      },
     
      
    ],
  },
  {
    path: '/side-login',
    name: 'SideLogin',
    component: SideLogin
  },
    
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
