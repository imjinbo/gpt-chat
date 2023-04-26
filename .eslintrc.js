module.exports = {
    root: false,
    env: {
        node: true
    },
    parserOptions: {
        ecmaVersion: 2020
    },
    extends: [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/typescript/recommended"
    ],
    rules: {
        "no-console": process.env.NODE_ENV === "prod" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "prod" ? "warn" : "off",
        "vue/no-v-model-argument": "off",
        "vue/custom-event-name-casing": "off",
        "vue/script-setup-uses-vars": "off",
        "vue/no-unused-vars": "off",
        //在vue中的template中如果标签内只有很短的内容，不要求其换行
        "vue/singleline-html-element-content-newline": "off",
        "vue/no-v-for-template-key": "off"
    }
};
