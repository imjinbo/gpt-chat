<template>
    <div>
        <transition>
            <div class="loader-container" v-show="loading">
                <div class="loader"></div>
                <span>{{loadText}}</span>
            </div>
        </transition>
        <div class="main">
            <input type="checkbox" id="chk" aria-hidden="true" />

            <div class="login">
                <form class="form" @submit.prevent="handleLogin">
                    <label for="chk" aria-hidden="true">登录Chat</label>
                    <input v-model="loginData.userName" class="input" type="txt" name="txt" placeholder="请输入账户" required maxlength="6" />
                    <input v-model="loginData.password" class="input" type="password" name="pswd" placeholder="请输入密码" required maxlength="10" />
                    <button>确认登录</button>
                </form>
            </div>

            <div class="register">
                <form class="form" @submit.prevent="handleReg">
                    <label for="chk" aria-hidden="true">注册</label>
                    <input v-model="regData.userName" class="input" type="text" name="txt" placeholder="请输入账户" required />
                    <input v-model="regData.password" class="input" type="password" name="pswd" placeholder="请输入密码" required />
                    <!-- <input class="input" type="password" name="pswd" placeholder="请重复确认密码" required /> -->
                    <button>提交</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import { reactive, onMounted, toRefs } from "vue";
    import axios from "axios";
    import config from "@/config/config";
    import messageUtil from "@/utils/messageUtil";
    import dayjs from "dayjs";
    import { useRouter } from "vue-router";

    export default {
        setup(props, { emit }) {
            const router = useRouter();
            const state = reactive({
                loading: false,
                loadText: "",
                loginData: {
                    userName: "",
                    password: ""
                    // expireTime: ""
                },
                regData: {
                    userName: "",
                    password: "",
                    expireTime: ""
                }
            });
            const methods = {
                handleLogin() {
                    // router.replace("/content");
                    state.loading = true;

                    state.loadText = "登录中，请稍后";

                    if (state.loginData.userName && state.loginData.password) {
                        axios({
                            method: "post",
                            url: config.publicDomanHttp + "user/login",
                            data: state.loginData
                        })
                            .then((res) => {
                                if (res.data) {
                                    // sessionStorage.setItem("expireTime");
                                    methods.getExpreTime(res.data).then((res) => {
                                        router.replace("/content");
                                    });
                                    // router
                                    // setTimeout(methods.handleeLogin, 1000);
                                }
                            })
                            .catch((err) => {
                                state.loading = false;
                                messageUtil({
                                    type: "danger",
                                    content: err.response.data.message
                                });
                            });
                    }
                },
                getExpreTime(userId) {
                    return new Promise((resolve) => {
                        axios({
                            method: "GET",
                            url: config.publicDomanHttp + "/user/getUserDetails",
                            params: {
                                userId: String(userId)
                            }
                        })
                            .then((res) => {
                                if (res.status == 200) {
                                    // 在这里设置页面的变量
                                    // 无用
                                    sessionStorage.setItem("access-token", userId);
                                    // 首页的提示语
                                    sessionStorage.setItem(
                                        "home-prompt",
                                        res.data.homeMess
                                    );
                                    // 使用的key
                                    sessionStorage.setItem(
                                        "home-key",
                                        res.data.key
                                    );
                                    // 网站标题
                                    sessionStorage.setItem(
                                        "home-title",
                                        res.data.siteName
                                    );

                                    resolve();
                                }
                            })
                            .catch((err) => {
                                state.loading = false;
                                messageUtil({
                                    type: "danger",
                                    content: err.response.data.message
                                });
                            });
                    });
                },
                handleReg() {
                    state.loading = true;
                    state.loadText = "正在发起注册，请稍后";
                    if (state.regData.userName && state.regData.password) {
                        const date = dayjs(); // 获取当前时间
                        const nextWeek = date.add(7, "day"); // 添加7天

                        axios({
                            method: "post",
                            url: config.publicDomanHttp + "user/register",
                            data: {
                                ...state.regData,
                                expireTime: new Date(
                                    nextWeek.format("YYYY-MM-DD HH:mm:ss")
                                ).getTime()
                            }
                        })
                            .then((res) => {
                                if (res.data == "注册成功") {
                                    setTimeout(methods.handleLogin, 1000);
                                } else {
                                    state.loading = false;
                                    messageUtil({
                                        type: "danger",
                                        content: res.data
                                    });
                                }
                            })
                            .catch((err) => {
                                state.loading = false;
                                messageUtil({
                                    type: "danger",
                                    content: err
                                });
                            });
                    }
                }
            };

            onMounted(() => {
                console.log("Mounted!");
            });

            return {
                ...methods,
                ...toRefs(state)
            };
        }
    };
</script>

<style lang="less" scoped>
    .main {
        position: relative;
        display: flex;
        flex-direction: column;
        background-color: #240046;
        max-height: 490px;
        min-width: 300px;
        overflow: hidden;
        border-radius: 12px;
        box-shadow: 7px 7px 10px 3px #24004628;
        padding-bottom: 20px;
        // margin: 0 auto;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 36px 24px;
    }

    /*checkbox to switch from sign up to login*/
    #chk {
        display: none;
    }

    /*Login*/
    .login {
        position: relative;
        width: 100%;
        height: 100%;
        .form {
            padding-bottom: 24px;
        }
    }

    .login label {
        margin: 25% 0 5%;
    }

    label {
        color: #fff;
        font-size: 2rem;
        justify-content: center;
        display: flex;
        font-weight: bold;
        cursor: pointer;
        transition: 0.5s ease-in-out;
    }

    .input {
        // width: 100%;
        height: 40px;
        background: #e0dede;
        padding: 10px;
        border: none;
        outline: none;
        border-radius: 4px;
    }

    /*Register*/
    .register {
        background: #eee;
        border-radius: 60% / 10% 0 0 0;
        transform: translateY(5%);
        transition: 0.8s ease-in-out;
        .form {
            padding-bottom: 69px;
        }
    }

    .register label {
        color: #573b8a;
        transform: scale(0.6);
    }

    #chk:checked ~ .register {
        transform: translateY(-60%);
    }

    #chk:checked ~ .register label {
        transform: scale(1);
        margin: 10% 0 5%;
    }

    #chk:checked ~ .login label {
        transform: scale(0.6);
        margin: 5% 0 5%;
    }
    /*Button*/
    .form button {
        width: 85%;
        height: 40px;
        margin: 12px auto 10%;
        color: #fff;
        background: #573b8a;
        font-size: 1rem;
        font-weight: bold;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: 0.2s ease-in;
    }

    .form button:hover {
        background-color: #6d44b8;
    }
</style>

<style scoped lang="less">
    .loader-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        background: rgb(239 239 239 / 67%);
        & > span {
            position: absolute;
            top: 56%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-weight: bold;
        }
    }
    .loader {
        position: relative;
        width: 2.5em;
        height: 2.5em;
        transform: rotate(165deg);
    }

    .loader:before,
    .loader:after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        width: 0.5em;
        height: 0.5em;
        border-radius: 0.25em;
        transform: translate(-50%, -50%);
    }

    .loader:before {
        animation: before8 2s infinite;
    }

    .loader:after {
        animation: after6 2s infinite;
    }

    @keyframes before8 {
        0% {
            width: 0.5em;
            box-shadow: 1em -0.5em rgba(225, 20, 98, 0.75),
                -1em 0.5em rgba(111, 202, 220, 0.75);
        }

        35% {
            width: 2.5em;
            box-shadow: 0 -0.5em rgba(225, 20, 98, 0.75),
                0 0.5em rgba(111, 202, 220, 0.75);
        }

        70% {
            width: 0.5em;
            box-shadow: -1em -0.5em rgba(225, 20, 98, 0.75),
                1em 0.5em rgba(111, 202, 220, 0.75);
        }

        100% {
            box-shadow: 1em -0.5em rgba(225, 20, 98, 0.75),
                -1em 0.5em rgba(111, 202, 220, 0.75);
        }
    }

    @keyframes after6 {
        0% {
            height: 0.5em;
            box-shadow: 0.5em 1em rgba(61, 184, 143, 0.75),
                -0.5em -1em rgba(233, 169, 32, 0.75);
        }

        35% {
            height: 2.5em;
            box-shadow: 0.5em 0 rgba(61, 184, 143, 0.75),
                -0.5em 0 rgba(233, 169, 32, 0.75);
        }

        70% {
            height: 0.5em;
            box-shadow: 0.5em -1em rgba(61, 184, 143, 0.75),
                -0.5em 1em rgba(233, 169, 32, 0.75);
        }

        100% {
            box-shadow: 0.5em 1em rgba(61, 184, 143, 0.75),
                -0.5em -1em rgba(233, 169, 32, 0.75);
        }
    }

    .loader {
        position: absolute;
        top: calc(50% - 1.25em);
        left: calc(50% - 1.25em);
    }
    .v-enter-active,
    .v-leave-active {
        transition: opacity 0.5s ease;
    }

    .v-enter-from,
    .v-leave-to {
        opacity: 0;
    }
</style>
