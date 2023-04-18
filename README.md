# ChatGPT

## 介绍

🤪 ChatGPT 基于 gpt-3.5-turbo 开发

本项目纯前端自娱自乐，数据仅在 localStorage 中读取

国内随意访问，解决 api 无法访问问题

瞎写一通，功能简单所以代码较臭

预览：[ChatGPT](https://chatgpt.n0ts.cn/)

## 使用

本项目基于 Vue3 + Ts 开发，部署需要了解 yarn 工具的相关使用；  
又或者直接使用 `dist` 文件夹中内容即可

首先安装此项目需要的包

```shell
yarn
```

然后直接打包即可

```shell
yarn build
```

配置代理域名和初始化api-key均需要在 ./src/config/config.ts 进行更换

打包后则可在 `dist` 文件夹看到打包后的文件，直接丢到服务器即可访问

<!-- [node api tools: 基于 Node 的常用 API 开放](https://gitee.com/n0ts/node-api-tools) -->