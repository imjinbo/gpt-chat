/*
 * @Author: N0ts
 * @Date: 2023-03-02 15:53:15
 * @Description: main
 * @FilePath: /chat-gpt/src/main.ts
 * @Mail：mail@n0ts.top
 */

import { createApp } from "vue";
import "@/assets/css/global.less";
import "@/assets/css/messageUtil.less";
import "@/assets/css/markdown.less";
import App from "./App.vue";

const app = createApp(App);
app.mount("#app");
