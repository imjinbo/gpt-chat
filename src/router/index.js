import contentPage from '../view/contentPage.vue';
import loginPage from '../view/loginPage.vue';
import { createRouter, createWebHashHistory } from 'vue-router'

// 静态路由页面
export const allowRouter = [
    { name: '', path: '/', component: loginPage },
    { name: 'content', path: '/content', component: contentPage },
    { name: '404', path: '/ErrorPage', component: loginPage },
]

const router = createRouter({
    history: createWebHashHistory(), // createWebHistory
    routes: allowRouter
})

export default router