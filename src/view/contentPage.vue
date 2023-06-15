<!--
 * @Author: N0ts
 * @Date: 2023-03-02 15:53:15
 * @Description: ChatGPT
 * @FilePath: /chat-gpt/src/App.vue
 * @Mail：mail@n0ts.top
-->
<template>
    <div id="chatgpt" :class="{ print: exportLoading }">
        <div id="sidebar" v-if="!exportLoading" :class="{ sideBarShow: sideBarShow }">
            <div class="btns">
                <div class="btn" @click="newClient">➕ 新建会话</div>
            </div>
            <div id="chats" v-if="!exportLoading">
                <div v-for="(item, index) in clients" :key="index" @click="clientsIndex = index" :class="{ active: clientsIndex == index }">
                    <p>{{ item.name }}</p>
                    <span @click.stop="removeClient(index)">🗑 删除</span>
                </div>
            </div>
            <div id="bottom">
                <div class="btn" @click="themeUtil.switchTheme">
                    {{
                    themeUtil.themeCache.value == "light"
                    ? "🌞 暗色模式"
                    : "🌛 亮色模式"
                    }}
                </div>
                <!-- <div class="btn" @click="settingShow = true">🎡 打开配置</div> -->
                <div class="btn" @click="reloadConfig">🎆重置配置</div>
                <div class="money" v-if="moneyData">
                    余额：{{
                    moneyToFixed(moneyData.total_available, 2)
                    }}
                    $，已用：{{ moneyToFixed(moneyData.total_used, 2) }} $
                </div>
            </div>
            <div id="showBtn" @click="sideBarShow = !sideBarShow">{{ sideBarShow ? "👈" : "👉" }}</div>
        </div>
        <div id="main">
            <!-- <div id="title">{{ clients[clientsIndex].name }}</div> -->
            <div id="messages" :class="{ print: exportLoading }" v-if="clients[clientsIndex]">
                <div v-for="(item, index) in clients[clientsIndex].contents" :key="index" :class="item.role == 'user' ? 'right' : 'left'">
                    <div class="img">
                        <div v-if="item.role == 'system'" class="system">SY</div>
                        <div v-else-if="item.role == 'user'" class="user">🧐</div>
                        <div v-else class="ai">👨🏼‍🚀</div>
                    </div>
                    <div
                        class="content"
                        :class="{
                            end:
                                !loading ||
                                index !=
                                    clients[clientsIndex].contents.length - 1
                        }"
                        v-html="item.content"
                    ></div>
                    <!-- <div class="tokens">
              tokens：{{ item.tokens == 0 ? "..." : item.tokens }}
                    </div>-->
                </div>
                <div id="stretch" v-if="!exportLoading"></div>
            </div>
            <div v-else id="home">
                <!-- <div>
                    <p>🤪 ChatGPT 基于 gpt-3.5-turbo 开发</p>
                    <div class="content">
                        <p>本项目纯前端自娱自乐，数据仅在 localStorage 中读取</p>
                        <p>国内随意访问，解决 api 无法访问问题</p>
                        <p>由于使用了海外代理服务器，所以偶尔会出现响应速度慢或者无法响应的问题</p>
                        <p>瞎写一通，功能简单所以代码较臭</p>
                        <p>
                            开源地址（求 star）：
                            <a href="https://gitee.com/n0ts/chat-gpt" target="_blank">Gitee</a>
                        </p>
                        <p>
                            技术交流：
                            <a href="https://jq.qq.com/?_wv=1027&k=Mh7ah6Dd">坚果小栈</a>
                        </p>
                    </div>
                </div>-->
                <div v-html="homePrompt">
                  
                </div>
                  <!-- <p>🙂千禧GPT使用规范，恳请大家遵守</p>
                    <div class="content-text">
                        <ol>
                            <li>请遵纪守法，不要输入不好的言语</li>
                            <li>请勿输入涉及到个人隐私的信息，以防泄密</li>
                            <li>如果Key失效，请清理浏览器缓存后点击左侧的重置配置菜单</li>
                        </ol>
                        <span>
                            如果您有自己的OpenAI API
                            Key，可以点击左侧打开配置菜单，输入自己的Key使用
                        </span>
                    </div>-->
            </div>
            <div id="input" v-if="!exportLoading">
                <div class="stop" :class="{ stopShow: loading }" @click="stopMessage">停止回复 🛑</div>
                <div class="toolbar">
                    <div class="icon-btn" @click="exportPdf">📜</div>
                    <select id="identity-select" @change="handleIdentityChange">
                        <option v-for="(item,index) in identityList" :key="index" :value="item.resume">{{ item.resume }}</option>
                    </select>
                </div>
                <!-- <p>tokens 总和：{{ tokensCountNum }}</p> -->
                <div class="textarea">
                    <textarea v-model="message" @keydown="keydown" @keyup="keyup" :style="{ height: textareaHeight + 'px' }"></textarea>
                    <div class="btn" id="submit-btn" @click="send">发送</div>
                </div>
            </div>
        </div>
    </div>

    <!-- <DialogCom title :show="loginShow" class="login-form-dialog">
        <template #center>
            <loginPage @success="loginShow = false"></loginPage>
        </template>
    </DialogCom>-->

    <DialogCom title="输入 key" :show="okKeyDialog">
        <template #center>
            <p>请在下方输入你的 key</p>
            <!-- <p>
                申请地址：
                <a href="https://platform.openai.com/account/api-keys" target="_blank">点我</a>
            </p>-->
            <input v-model="confirmKey" @keydown.enter="okKey" />
            <p class="tips">key 会保存在本地浏览器(localStorage)中，只供本地使用</p>
        </template>
        <template #bottom>
            <button class="success" @click="okKey">提交</button>
        </template>
    </DialogCom>

    <DialogCom title="设置" :show="settingShow">
        <template #center>
            <div class="panel">
                <div>
                    <p>key：</p>
                    <input type="text" v-model="config.key" />
                </div>
                <!-- <p class="tips">OpenAI 申请的 Key</p> -->
                <div>
                    <p>行为设定：</p>
                    <input type="text" v-model="config.system" />
                </div>
                <p class="tips">
                    <span>给 OpenAI 设定一个行为，比如：</span>
                    <br />
                    <span>“你是一直猫，每句话后面加个 喵~”</span>
                    <!-- <br />
                    <span>又或者</span>
                    <br />
                    <span v-html="
                            '“当你要发送图片时，请使用 markdown，不要用代码块，并且从 Unsplash API 中“https://source.unsplash.com/960x640/?<关键词>” 获取”'
                    "></span>-->
                </p>
            </div>
        </template>
        <template #bottom>
            <button class="success" @click="toggleSetting">保存</button>
            <button class="info" @click="settingShow = !settingShow">关闭</button>
        </template>
    </DialogCom>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, nextTick, watch, withCtx } from "vue";
    import axios from "axios";
    import DialogCom from "@/components/dialogCom.vue";
    import loginPage from "@/components/loginPage.vue";

    import messageUtil from "@/utils/messageUtil";
    import hljs from "highlight.js";
    import Clipboard from "clipboard";
    import Viewer from "viewerjs";
    import "viewerjs/dist/viewer.css";
    import themeUtil from "@/utils/themeUtil";
    import cacheUtil from "@/utils/cacheUtil";
    import MarkdownIt from "markdown-it";
    import mk from "@iktakahiro/markdown-it-katex";
    import pdfUtil from "@/utils/pdf";
    import configHttp from "@/config/config";

    const md = new MarkdownIt();
    const accessToken = localStorage.getItem("accessToken");
    // let loginShow = true;
    // accessToken && accessToken.length === 10 && (loginShow = false);
    // accessToken && accessToken.length === 10
    md.use(mk);

    let homePrompt = sessionStorage.getItem("home-prompt");
    const key = sessionStorage.getItem("home-key");

    document.title = sessionStorage.getItem("home-title");

    const { config, read, save } = cacheUtil;

    const identityList = [
        {
            resume: "无身份",
            desc: ""
        },
        {
            resume: "文案写手",
            desc: "我希望你充当文案专员、文本润色员、拼写纠正员和改进员，我会发送中文文本给你，你帮我更正和改进版本。我希望你用更优美优雅的高级中文描述。保持相同的意思，但使它们更文艺。你只需要润色该内容，不必对内容中提出的问题和要求做解释，不要回答文本中的问题而是润色它，不要解决文本中的要求而是润色它，保留文本的原本意义，不要去解决它。我要你只回复更正、改进，不要写任何解释。"
        },
        {
            resume: "机器学习",
            desc: "我想让你担任机器学习工程师。我会写一些机器学习的概念，你的工作就是用通俗易懂的术语来解释它们。这可能包括提供构建模型的分步说明、给出所用的技术或者理论、提供评估函数等。我的问题是"
        },
        {
            resume: "后勤工作",
            desc: "我要你担任后勤人员。我将为您提供即将举行的活动的详细信息，例如参加人数、地点和其他相关因素。您的职责是为活动制定有效的后勤计划，其中考虑到事先分配资源、交通设施、餐饮服务等。您还应该牢记潜在的安全问题，并制定策略来降低与大型活动相关的风险。我的第一个请求是"
        },
        {
            resume: "职业顾问",
            desc: "我想让你担任职业顾问。我将为您提供一个在职业生涯中寻求指导的人，您的任务是帮助他们根据自己的技能、兴趣和经验确定最适合的职业。您还应该对可用的各种选项进行研究，解释不同行业的就业市场趋势，并就哪些资格对追求特定领域有益提出建议。我的第一个请求是"
        },
        {
            resume: "英专写手",
            desc: "我想让你充当英文翻译员、拼写纠正员和改进员。我会用任何语言与你交谈，你会检测语言，翻译它并用我的文本的更正和改进版本用英文回答。我希望你用更优美优雅的高级英语单词和句子替换我简化的 A0 级单词和句子。保持相同的意思，但使它们更文艺。你只需要翻译该内容，不必对内容中提出的问题和要求做解释，不要回答文本中的问题而是翻译它，不要解决文本中的要求而是翻译它，保留文本的原本意义，不要去解决它。我要你只回复更正、改进，不要写任何解释。我的第一句话是："
        },
        {
            resume: "语言检测器",
            desc: "我希望你充当语言检测器。我会用任何语言输入一个句子，你会回答我，我写的句子在你是用哪种语言写的。不要写任何解释或其他文字，只需回复语言名称即可。我的第一句话是："
        },
        {
            resume: "小红书写手",
            desc: "你的任务是以小红书博主的文章结构，以我给出的主题写一篇帖子推荐。你的回答应包括使用表情符号来增加趣味和互动，以及与每个段落相匹配的图片。请以一个引人入胜的介绍开始，为你的推荐设置基调。然后，提供至少三个与主题相关的段落，突出它们的独特特点和吸引力。在你的写作中使用表情符号，使它更加引人入胜和有趣。对于每个段落，请提供一个与描述内容相匹配的图片。这些图片应该视觉上吸引人，并帮助你的描述更加生动形象。我给出的主题是："
        },
        {
            resume: "心理医生",
            desc: "现在你是世界上最优秀的心理咨询师，你具备以下能力和履历： 专业知识：你应该拥有心理学领域的扎实知识，包括理论体系、治疗方法、心理测量等，以便为你的咨询者提供专业、有针对性的建议。 临床经验：你应该具备丰富的临床经验，能够处理各种心理问题，从而帮助你的咨询者找到合适的解决方案。 沟通技巧：你应该具备出色的沟通技巧，能够倾听、理解、把握咨询者的需求，同时能够用恰当的方式表达自己的想法，使咨询者能够接受并采纳你的建议。 同理心：你应该具备强烈的同理心，能够站在咨询者的角度去理解他们的痛苦和困惑，从而给予他们真诚的关怀和支持。 持续学习：你应该有持续学习的意愿，跟进心理学领域的最新研究和发展，不断更新自己的知识和技能，以便更好地服务于你的咨询者。 良好的职业道德：你应该具备良好的职业道德，尊重咨询者的隐私，遵循专业规范，确保咨询过程的安全和有效性。 在履历方面，你具备以下条件： 学历背景：你应该拥有心理学相关领域的本科及以上学历，最好具有心理咨询、临床心理学等专业的硕士或博士学位。 专业资格：你应该具备相关的心理咨询师执业资格证书，如注册心理师、临床心理师等。 工作经历：你应该拥有多年的心理咨询工作经验，最好在不同类型的心理咨询机构、诊所或医院积累了丰富的实践经验。"
        },
        {
            resume: "创业点子王",
            desc: "在企业 B2B SaaS 领域中想 3 个创业点子。创业点子应该有一个强大而引人注目的使命，并以某种方式使用人工智能。避免使用加密货币或区块链。创业点子应该有一个很酷很有趣的名字。这些想法应该足够引人注目，这样投资者才会兴奋地投资数百万美元。"
        },
        {
            resume: "互联网写手",
            desc: "你是一个专业的互联网文章作者，擅长互联网技术介绍、互联网商业、技术应用等方面的写作。接下来你要根据用户给你的主题，拓展生成用户想要的文字内容，内容可能是一篇文章、一个开头、一段介绍文字、文章总结、文章结尾等等。要求语言通俗易懂、幽默有趣，并且要以第一人称的口吻。"
        },
        {
            resume: "心灵导师",
            desc: "从现在起你是一个充满哲学思维的心灵导师，当我每次输入一个疑问时你需要用一句富有哲理的名言警句来回答我，并且表明作者和出处。要求字数不少于15个字，不超过30字，每次只返回一句且不输出额外的其他信息，你需要使用中文和英文双语输出"
        }
    ];

    // 读取配置
    read();

    // 输入 key dialog
    const okKeyDialog = ref(config.key == "");

    // 获取聊天窗口 dom
    let messageDom: Element | null = null;
    // Viewer
    let viewer: unknown = null;

    onMounted(() => {
        viewer = new Viewer(document.querySelector("#main") as HTMLElement);
        messageDom = document.querySelector("#messages");
        themeUtil.load();

        const script = document.createElement("script");
        script.defer = true;
        script.type = "text/javascript";
        script.src = "./audioIndex.js";

        // 将脚本添加到文档底部
        document.body.appendChild(script);
    });

    /**
     * 确认 key
     */
    const confirmKey = ref("");

    function okKey() {
        if (confirmKey.value == "") {
            return messageUtil({
                type: "warning",
                content: "key 不能为空"
            });
        }

        config.key = confirmKey.value;
        confirmKey.value = "";
        save();

        okKeyDialog.value = false;
        messageUtil({
            type: "success",
            content: "key 存储成功，开始提问吧"
        });

        // getMoney();
    }

    // 是否正在加载
    const loading = ref(false);

    /**
     * 提交问题
     */
    async function submit() {
        loading.value = true;
        const clientCache = clients[clientsIndex.value].contents;
        const lastClientCache = clientCache[clientCache.length - 1];
        if (lastClientCache.role != "assistant") pushResult("assistant", "");

        let cacheSystemClient: IMessage | null = null;
        if (clientCache[0].role == "system") {
            cacheSystemClient = clientCache[0];
        }
        const messages = clientCache.slice(
            clients[clientsIndex.value].exceedTokens * 2
        );
        if (cacheSystemClient) {
            messages.unshift(cacheSystemClient);
        }

        fetch(config.proxyHttp + "/v1/chat/completions", {
            method: "POST",
            body: JSON.stringify({
                // key: config.key,
                stream: true,
                model: config.data.model,
                messages: messages.map((item) => {
                    // HACK 过滤掉前几个聊天会话
                    return {
                        role: item.role,
                        content: item.stream
                    };
                }),
                max_tokens: 2000
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`
            }
        })
            .then((res: any) => {
                const reader = res.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let streamCache = "";

                reader.read().then(async function processText(res: any) {
                    if (res.done || !loading.value) {
                        return;
                    }

                    const decodeContent = decoder.decode(res.value);

                    // error
                    if (decodeContent.includes(`"error": {\n`)) {
                        loading.value = false;
                        return errorHandle(decodeContent);
                    }

                    // done
                    if (decodeContent.includes("data: [DONE]")) {
                        loading.value = false;
                        const client =
                            clients[clientsIndex.value].contents[
                                clients[clientsIndex.value].contents.length - 1
                            ];
                        client.tokens = await computedToken(client.content);

                        saveMessage();
                        await nextTick();
                        hljsInit();
                        viewer.update();
                        return;
                    }

                    decodeContent
                        .replaceAll("data: ", "")
                        .split("\n")
                        .filter(Boolean)
                        .forEach(async (item: string) => {
                            const itemObj = JSON.parse(item);
                            if (!itemObj.choices[0].delta.content) {
                                return;
                            }

                            const str = itemObj.choices[0].delta.content;

                            streamCache += str;

                            clients[clientsIndex.value].contents[
                                clients[clientsIndex.value].contents.length - 1
                            ].content = md.render(streamCache);
                            clients[clientsIndex.value].contents[
                                clients[clientsIndex.value].contents.length - 1
                            ].stream = streamCache;
                            await nextTick();
                            hljsInit();
                        });

                    return reader.read().then(processText);
                });
            })
            .catch(() => {
                clients[clientsIndex.value].contents[
                    clients[clientsIndex.value].contents.length - 1
                ].content =
                    "<p>发起网络请求失败，服务器可能正在维护中，请稍后重试</p>";
                messageUtil({
                    type: "danger",
                    content: "发起网络请求失败，请稍后重试"
                });
                saveMessage();
                loading.value = false;
            });
    }
    // 身份切换
    function handleIdentityChange(params: object) {
        let str =
            clientsIndex.value !== -1 ? "让我们重新开始对话，忘记之前的讨论。" : "";

        const findData = identityList.find((t) => t.resume == params.target.value);
        message.value = str + findData.desc;
        send();
    }

    /**
     * 存入数据
     */
    async function pushResult(
        role: "user" | "assistant" | "system",
        content: string,
        errContent?: string
    ) {
        const resultContent = errContent ? errContent : content;
        const contentData = {
            role,
            content: resultContent,
            tokens: 0,
            stream: resultContent
        };
        clients[clientsIndex.value].contents.push(contentData);
        contentData.tokens = await computedToken(contentData.stream);
        saveMessage();
        await nextTick();
        hljsInit();
        viewer.update();
    }

    /**
     * 保存会话
     */
    function saveMessage() {
        window.localStorage.setItem("message-data", JSON.stringify(clients));
        tokensCount();
    }

    // 消息框内容
    const message = ref("");

    /**
     * 发送消息
     */
    function send() {
        const accessToken = sessionStorage.getItem("access-token");
        if (!accessToken) {
            const a = "请正";
            const b = "常";
            const c = "使用";
            const d = "，感谢";
            const e = "您的";
            const f = "配合";

            return messageUtil({
                type: "danger",
                content: a + b + c + d + e + f
            });
        }
        if (message.value == "" || message.value.trim() == "" || loading.value) {
            return;
        }

        // 没有对话时
        if (clientsIndex.value == -1) {
            clients.unshift({
                name: "",
                contents: [],
                exceedTokens: 0
            });
            clientsIndex.value = 0;
        }

        // 是否设置了行为
        if (config.system && clients[clientsIndex.value].contents.length == 0) {
            pushResult("system", md.render(config.system));
        }

        pushResult("user", md.render(message.value));

        // 第一句对话修改标题
        if (
            clients[clientsIndex.value].contents.length == 1 ||
            (clients[clientsIndex.value].contents[0].role == "system" &&
                clients[clientsIndex.value].contents.length == 2)
        ) {
            const cacheName = message.value;
            let num = 1;
            clients.forEach((item) => {
                if (item.name.indexOf(cacheName) == 0) {
                    num++;
                }
            });
            clients[clientsIndex.value].name =
                cacheName + (num == 1 ? "" : ` #${num}`);
            document.title = cacheName + " | ChatGPT";
        }

        // 清空输入框
        message.value = "";

        submit();
    }

    /**
     * 滚动到底部
     */
    let scrollLock = false;

    function scrollToBottom() {
        if (scrollLock) {
            return;
        }
        scrollLock = true;
        setTimeout(() => {
            scrollLock = false;
            messageDom = document.querySelector("#messages");
            if (messageDom) {
                // const childrens = messageDom.children;
                // let height = 0;
                // if (childrens[childrens.length - 1]) {
                //     height += childrens[childrens.length - 1].clientHeight;
                // }
                // if (childrens[childrens.length - 2]) {
                //     height += childrens[childrens.length - 2].clientHeight;
                // }
                messageDom.scrollTo({
                    top: messageDom.scrollHeight,
                    behavior: "smooth"
                });
            } else {
                scrollToBottom();
            }
        }, 300);
    }

    // shift 是否按住
    let shiftDown = false;

    /**
     * 消息框键盘按下
     */
    function keydown(event: KeyboardEvent) {
        // shift 是否按下
        if (event.keyCode === 16) {
            shiftDown = true;
        }
        // shift 不按住与 enter 按下，则发送
        if (!shiftDown && event.keyCode === 13) {
            send();
            event.preventDefault();
            return false;
        }
    }

    /**
     * 消息框键盘抬起
     */
    function keyup(event: KeyboardEvent) {
        // shift 是否取消按下
        if (event.keyCode === 16) {
            shiftDown = false;
        }
    }

    // 消息框高度
    const textareaHeight = ref(24);

    // 监听消息框内容变化改变高度
    watch(
        () => message.value,
        () => {
            // 根据换行符计算高度
            const lines = message.value.split("\n").length;
            textareaHeight.value = lines * 24;
        }
    );

    // 消息列表
    interface IMessage {
        role: "user" | "assistant" | "system";
        content: string;
        tokens: number;
        stream: string;
    }

    // 回话列表
    interface IClient {
        name: string;
        contents: Array<IMessage>;
        exceedTokens: number;
    }

    const cacheClients = window.localStorage.getItem("message-data");
    const clients: Array<IClient> = reactive(
        cacheClients ? JSON.parse(cacheClients) : []
    );
    const clientsIndex = ref(-1);

    // 会话索引切换
    watch(
        () => clientsIndex.value,
        async () => {
            if (clients[clientsIndex.value]) {
                document.title = clients[clientsIndex.value].name + " | 🤪ChatGPT";
                await nextTick();
                tokensCount();
                hljsInit();
                viewer.update();
                // MathJax.TypeSet();
            }
        }
    );

    /**
     * 创建新会话
     */
    function newClient() {
        saveMessage();
        let num = 1;
        clients.forEach((item) => {
            if (item.name.indexOf("新会话") == 0) {
                num++;
            }
        });
        clients.unshift({
            name: "新会话" + (num == 1 ? "" : ` #${num}`),
            contents: [],
            exceedTokens: 0
        });
        message.value = "";
        clientsIndex.value = 0;
    }

    /**
     * 删除会话
     */
    function removeClient(i: number) {
        // 删除会话
        document.title = "🤪ChatGPT";
        clients.splice(i, 1);
        clientsIndex.value = -1;
        saveMessage();
    }

    /**
     * 代码高亮
     */
    async function hljsInit() {
        const dom: any = [];
        const codeBlocks = document.querySelectorAll("#messages pre code");
        codeBlocks.forEach((cache) => {
            const item = cache as HTMLElement;
            if (item.getAttribute("class")?.includes("hljs")) {
                return;
            }
            const copyBtn = document.createElement("div");
            copyBtn.className = "copyBtn";
            copyBtn.innerHTML = "复制";
            copyBtn.setAttribute("code", item.innerText);
            copyBtn.addEventListener("click", (e) => {
                copyCode(e);
            });
            item.parentElement?.appendChild(copyBtn);
            hljs.highlightElement(item as HTMLElement);
            dom.push(item);
        });
        addCodeNum(dom);
        scrollToBottom();
    }

    /**
     * 添加代码行号
     */
    function addCodeNum(dom: any) {
        for (let i = 0; i < dom.length; i++) {
            const enter = dom[i].innerHTML.replace(/\n/g, "</li><li>");
            dom[i].innerHTML = `<ol><li>${enter}</li></ol>`.replace(
                "<li></li></ol>",
                "</ol>"
            );
        }
    }

    // 侧边栏显示
    const sideBarShow = ref(false);

    /**
     * 复制代码块
     */
    function copyCode(el: MouseEvent) {
        const code = (el.target as HTMLElement).getAttribute("code");
        if (code) {
            Clipboard.copy(code);
            messageUtil({
                type: "success",
                content: "复制成功"
            });
        }
    }

    /**
     * 重置配置
     */
    function reloadConfig() {
        window.localStorage.removeItem("message-data");
        window.localStorage.removeItem("n0ts-chatgpt-theme");
        window.localStorage.removeItem("n0ts-chatgpt-config");
        window.location.reload();
    }

    // 设置显示
    const settingShow = ref(false);

    /**
     * 确认设定
     */
    function toggleSetting() {
        settingShow.value = !settingShow.value;
        save();
        messageUtil({
            type: "success",
            content: "设置已保存"
        });
    }

    /**
     * 获取余额
     */
    const moneyData: any = ref(null);

    async function getMoney() {
        const { data } = await axios({
            method: "post",
            url: config.proxyHttp + "/quotas",
            data: {
                method: "GET",
                url: "https://api.openai.com/dashboard/billing/credit_grants",
                headers: {
                    authorization: `Bearer ${key}`
                }
            }
        });
        moneyData.value = data.data;
    }

    /**
     * 保留两位
     */
    function moneyToFixed(num: any, fixed: number) {
        return Number(num.toFixed(fixed));
    }

    /**
     * 错误处理
     */
    function errorHandle(error: string) {
        const errorObj = JSON.parse(
            error.replace("未知错误，请联系站长解决！", "")
        );
        console.error("报错了哥们", errorObj);

        if (errorObj.error.code == "invalid_api_key") {
            messageUtil({
                type: "danger",
                content: "API Key 错误，请重新配置"
            });
            key = "";
            save();
            okKeyDialog.value = true;
            return;
        } else if (errorObj.error.code == "context_length_exceeded") {
            // messageUtil({
            //     type: "danger",
            //     content: "会话内容已超出，已自动开启优化"
            // });
            clients[clientsIndex.value].exceedTokens += 1;
            return submit();
        }

        clients[clientsIndex.value].contents[
            clients[clientsIndex.value].contents.length - 1
        ].content = error;
    }

    /**
     * token 计算
     */
    async function computedToken(content: string) {
        return 0;
        // if (!content) {
        //     return 0;
        // }
        // const { data } = await axios({
        //     method: "GET",
        //     url: "https://api.n0ts.top/chatgpt/encoder",
        //     params: {
        //         content
        //     }
        // });
        // if (data.status == 400) {
        //     return 0;
        // }
        // return data.data.tokens / 2;
    }

    /**
     * tokens 总和
     */
    const tokensCountNum = ref(0);

    function tokensCount() {
        if (!clients[clientsIndex.value]) {
            return;
        }
        let count = 0;
        clients[clientsIndex.value].contents.forEach((item) => {
            count += item.tokens;
        });
        tokensCountNum.value = count;
    }

    /**
     * 暂停会话
     */
    function stopMessage() {
        loading.value = false;
    }

    /**
     * 导出 pdf
     */
    const exportLoading = ref(false);
    async function exportPdf() {
        exportLoading.value = true;
        await nextTick();
        await pdfUtil(
            "ChatGPT 对话导出 | " +
                new Date().toLocaleDateString().replaceAll("/", "-").toString(),
            "#main"
        );
        messageUtil({
            type: "success",
            content: "正在导出中，耐心稍等一会~"
        });
        exportLoading.value = false;
    }

    async function newBing() {
        const a = "\x1E";

        let { data: ids } = await axios.get("https://api.n0ts.top/bing/new");
        ids = ids.data;

        const ws = new WebSocket("wss://sydney.bing.com/sydney/ChatHub");

        const result: any = [];

        ws.onopen = () => {
            console.log("ws open");
            ws.send(JSON.stringify({ protocol: "json", version: 1 }) + a);
            ws.send(JSON.stringify({ type: 6 }) + a);
            ws.send(
                JSON.stringify({
                    arguments: [
                        {
                            source: "cib",
                            allowedMessageTypes: [
                                "Chat",
                                "InternalSearchQuery",
                                "InternalSearchResult",
                                "Disengaged",
                                "InternalLoaderMessage",
                                "RenderCardRequest",
                                "AdsQuery",
                                "SemanticSerp",
                                "GenerateContentQuery",
                                "SearchQuery"
                            ],
                            isStartOfSession: true,
                            verbosity: "verbose",
                            message: {
                                locale: "zh-CN",
                                market: "zh-CN",
                                region: "US",
                                author: "user",
                                inputMethod: "Keyboard",
                                text: "你好呀",
                                messageType: "Chat"
                            },
                            conversationSignature: ids.conversationSignature,
                            participant: {
                                id: ids.clientId
                            },
                            conversationId: ids.conversationId
                        }
                    ],
                    invocationId: "1",
                    target: "chat",
                    type: 4
                }) + a
            );
        };

        ws.onmessage = (e: MessageEvent) => {
            // type：1 消息
            e.data
                .split(a)
                .filter(Boolean)
                .forEach((str: any) => {
                    const r = JSON.parse(str);
                    result.push(r);
                    try {
                        if (r.arguments[0].messages[0].text) {
                            console.log(r.type, r.arguments[0].messages[0].text);
                        } else {
                            console.log(r.arguments[0].messages[0]);
                        }
                    } catch {
                        console.log(r);
                    }
                });
        };

        ws.onclose = () => {
            console.log("ws close");
        };
    }
</script>

<style scoped lang="less">
    @import url("https://cdn.bootcdn.net/ajax/libs/firacode/6.2.0/fira_code.min.css");

    #chatgpt {
        height: 100%;
        display: flex;
        background-color: var(--background-color-1);
        color: var(--text-color);
        font-size: 0.9rem;

        > div {
            width: 100%;
        }

        #sidebar {
            // min-width: 300px;
            // width: 300px;
            min-width: 120px;
            width: 264px;
            height: 100%;
            background-color: #202123;
            position: relative;
            left: 0;
            top: 0;
            z-index: 1;
            color: white;
            display: flex;
            flex-direction: column;
            border-radius: 0 10px 10px 0;

            .btns {
                padding: 10px 10px 0;
            }

            .btn {
                border: 1px solid #ffffff33;
                padding: 10px 0 10px 30px;
                margin-bottom: 10px;
                border-radius: 5px;
                cursor: pointer;
                user-select: none;

                &:hover {
                    background-color: #2b2c2f;
                }
            }

            #chats {
                overflow-y: scroll;
                height: 100%;

                &::-webkit-scrollbar {
                    width: 10px;
                    height: 1px;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 10px;
                    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                    background: #444653;
                }

                &::-webkit-scrollbar-track {
                    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                }

                > div {
                    padding: 10px 0 10px 30px;
                    overflow: hidden;
                    margin-bottom: 10px;
                    position: relative;
                    border-radius: 5px;

                    p {
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        cursor: pointer;
                        overflow: hidden;
                        width: 70%;
                    }

                    span {
                        font-size: 0.8rem;
                        color: gray;
                        opacity: 0;
                        visibility: hidden;
                        position: absolute;
                        right: 20px;
                        top: 50%;
                        transform: translate(10px, -50%);
                        cursor: pointer;

                        &:hover {
                            color: red;
                        }
                    }

                    &:hover {
                        background-color: #2b2c2f;
                    }

                    &:hover span {
                        opacity: 1;
                        visibility: visible;
                        transform: translate(0, -50%);
                    }
                }

                .active {
                    background-color: #2b2c2f;
                }
            }

            #showBtn {
                position: absolute;
                top: 10%;
                right: 0;
                transform: translateX(100%);
                padding: 10px 15px;
                background-color: #202123;
                cursor: pointer;
                z-index: 1;
                user-select: none;
                visibility: hidden;
            }

            #bottom {
                border-top: 1px solid #ffffff33;
                width: 100%;
                padding: 10px 10px 0;
                box-sizing: border-box;

                .btn {
                    border: none;
                }

                .money {
                    padding: 10px 5px;
                }
            }
        }

        .sideBarShow {
            transform: translateX(0) !important;
        }

        #main {
            position: relative;
            display: flex;
            flex-direction: column;
            background-color: var(--background-color-1);

            #input {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 32%;
                padding: 0 20%;
                // display: flex;
                // justify-content: center;
                background-image: linear-gradient(
                    to bottom,
                    transparent,
                    var(--background-color-2) 40%
                );
                padding-top: 50px;
                box-sizing: border-box;

                .textarea {
                    // position: absolute;
                    // left: 50%;
                    // bottom: 30%;
                    // transform: translateX(-50%);
                    // width: 80%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    textarea {
                        width: 90%;
                        border-radius: 6px;
                        border: 1px solid var(--background-color-1);
                        background: var(--background-color-1);
                        outline: none;
                        resize: none;
                        padding: 15px 20px;
                        color: var(--text-color);
                        max-height: 150px;
                        overflow-y: auto;
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
                        font-size: 1rem;

                        &::-webkit-scrollbar {
                            width: 8px;
                            height: 1px;
                        }

                        &::-webkit-scrollbar-thumb {
                            border-radius: 10px;
                            box-shadow: none;
                            background: #565868;
                        }

                        &::-webkit-scrollbar-track {
                            box-shadow: none;
                            border-radius: 10px;
                            background: transparent;
                        }
                    }

                    .btn {
                        height: 24px;
                        background-color: #3e5bb1;
                        padding: 15px 20px;
                        border-radius: 6px;
                        white-space: nowrap;
                        margin-left: 10px;
                        cursor: pointer;
                        color: #fff;
                        border: 1px solid #ffffff00;

                        &:hover {
                            transition: all 0.4s;
                            background-color: #fff;
                            color: #3e5bb1;
                            border: 1px solid #3e5bb1;
                        }
                    }
                }

                p {
                    position: absolute;
                    left: 50%;
                    bottom: 10%;
                    transform: translateX(-50%);
                    font-size: 0.8rem;
                    opacity: 0.5;
                }

                .stop {
                    // position: absolute;
                    // left: 50%;
                    // top: 10%;
                    width: 90px;
                    z-index: 1;
                    padding: 5px 20px;
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    cursor: pointer;
                    opacity: 0;
                    visibility: hidden;
                    margin: 0 auto;
                    transform: translate(-50%, 10px);
                    text-align: center;
                    margin-bottom: 12px;
                    background-color: #ffffff;
                }

                .stopShow {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, 0);
                }
            }

            #title {
                padding: 20px 50px;
                border-bottom: 1px solid var(--background-color-2);
            }

            #messages {
                height: 100%;
                overflow-y: auto;

                &::-webkit-scrollbar {
                    width: 10px;
                    height: 1px;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 10px;
                    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                    background: #444653;
                }

                &::-webkit-scrollbar-track {
                    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                    background: var(--background-color-1);
                }

                #stretch {
                    height: 15%;
                    border-bottom: none;
                }

                > .right {
                    // background-color: var(--background-color-1);
                    flex-direction: row-reverse;

                    > .content {
                        // text-align: right;
                        background-color: var(--message-bg);
                    }
                }

                > .left {
                    // background-color: var(--background-color-2);

                    > .content {
                        background-color: var(--message-bg2);
                    }
                }

                > div {
                    padding: 25px 100px;
                    display: flex;
                    flex-wrap: nowrap;
                    // border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                    position: relative;

                    .tokens {
                        position: absolute;
                        right: 20px;
                        top: 10px;
                        opacity: 0.4;
                    }

                    .img {
                        border-radius: 5px;
                        min-width: 40px;
                        width: 40px;
                        height: 40px;
                        overflow: hidden;
                        user-select: none;
                        color: white;

                        div {
                            height: 100%;
                            text-align: center;
                            line-height: 40px;
                            font-size: 1.1rem;
                            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                        }

                        .system {
                            background-color: #679f92;
                        }

                        .user {
                            background-color: #4e66b5;
                        }

                        .ai {
                            background-color: #6c8ba4;
                        }
                    }
                }

                .content {
                    padding: 0 20px;
                    border-radius: 10px;
                    margin: 0 10px;
                }

                :deep(.content) > :not(ol):not(ul):not(pre):last-child:after,
                :deep(.content) > ol:last-child li:last-child:after,
                :deep(.content) > pre:last-child code:after,
                :deep(.content) > ul:last-child li:last-child:after {
                    content: "";
                    display: inline-block;
                    width: 8px;
                    height: 15px;
                    background-color: var(--text-color);
                    animation: blink 1s steps(5, start) infinite;
                    transform: translateY(3px);
                }

                @keyframes blink {
                    to {
                        visibility: hidden;
                    }
                }

                :deep(.end) * {
                    &::after {
                        display: none !important;
                    }
                }
            }

            .print {
                height: auto !important;
                overflow-y: initial !important;
            }

            #home {
                height: 100%;
                display: flex;
                justify-content: center;
                text-align: center;
                align-items: center;

                > div {
                    transform: translateY(-150px);

                    > p {
                        font-size: 2rem;
                        margin-bottom: 20px;
                        color: var(--text-color);
                    }

                    .content {
                        a {
                            color: rgb(0, 174, 255);
                        }
                    }
                }
            }
        }
    }

    .print {
        height: auto !important;
        overflow-y: initial !important;
    }

    @media screen and (max-width: 1200px) {
        #sidebar {
            position: absolute !important;
            transform: translateX(-100%);

            #showBtn {
                visibility: visible !important;
            }
        }

        #messages {
            > div {
                padding: 25px 50px !important;
            }
        }
    }

    @media screen and (max-width: 700px) {
        #messages {
            > div {
                padding: 25px 20px !important;
            }
        }

        #chats .list > div span {
            opacity: 1 !important;
            visibility: visible !important;
            transform: translateX(0) !important;
            color: red !important;
        }
    }

    @media screen and (max-width: 450px) {
        #messages {
            > div {
                padding: 25px 10px !important;
            }
        }
    }
    .content-text {
        text-align: left;
        width: 90%;
        position: absolute;
        left: 50%;
        line-height: 2;
        transform: translate(-50%);
    }
    .toolbar {
        position: absolute;
        top: 0;
        display: flex;
        #identity-select {
            border-radius: 4px;
            outline: none;
            height: 30px;
            margin-left: 10px;
            border: 1px solid #e4e4e4;
            position: relative;
            top: 4px;
        }
    }
    .icon-btn {
        // height: 24px;
        // background-color: #3e5bb1;
        padding: 8px;
        border-radius: 6px;
        white-space: nowrap;
        margin-left: 10px;
        cursor: pointer;
        color: #fff;
        border: 1px solid #ffffff00;

        &:hover {
            transition: all 0.4s;
            background-color: #fff;
            color: #3e5bb1;
            border: 1px solid #3e5bb1;
        }
    }
    .login-form-dialog {
        :deep(#main) {
            background-color: #e8e8e8 !important;
            width: 100% !important;
            height: 100%;
        }
    }
</style>
