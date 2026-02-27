# web-tools

这是一个基于 Vue 3 和 Element Plus 构建的个人多功能 Web 工具集。

## ✨ 主要功能

### 隔空传送 (Air Share)

一个安全、便捷的跨设备文本传输工具。

- **端到端加密**: 所有文本在发送前均在您的浏览器中使用 **Web Crypto API (AES-GCM)** 进行加密。服务器只存储加密后的密文，无法解密您的内容。
- **临时存储**: 使用 **Firebase 实时数据库** 作为加密数据的临时中转站。
- **阅后即焚**: 数据在被成功提取一次后，会立即从服务器删除。
- **自动过期**: 借助 Firebase 安全规则，任何数据在创建 **30 分钟**后将自动变得不可读取，确保隐私。
- **一键复制**: 轻松复制生成的4位提取码。

## 🛠️ 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/) (使用组合式 API `<script setup>`)
- **构建工具**: [Vite](https://vitejs.dev/)
- **UI 库**: [Element Plus](https://element-plus.org/)
- **后端服务 (BaaS)**: [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- **加密**: 浏览器原生 [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## 📁 项目结构


## 🚀 快速开始

### 1. 安装依赖

在项目根目录下运行：

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建一个名为 `.env.local` 的文件，并填入您的 Firebase 项目配置。您可以复制 `.env.local.example` 的内容作为模板。

```ini
# .env.local

VITE_FIREBASE_API_KEY="YOUR_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
VITE_FIREBASE_DATABASE_URL="YOUR_DATABASE_URL"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_APP_ID"
```

### 3. 配置 Firebase 安全规则

为了使“隔空传送”功能正常工作，请确保您的 Firebase 实时数据库的**规则**已设置为：

```json
{
  "rules": {
    "shares": {
      "$share_id": {
        // 读取规则：30分钟内可读
        ".read": "now < data.child('createdAt').val() + 1800000",
        // 写入规则：允许创建或删除
        ".write": "!data.exists() || !newData.exists()",
        // 验证规则：写入时必须包含数字类型的时间戳
        ".validate": "newData.hasChild('createdAt') && newData.child('createdAt').isNumber()"
      }
    }
  }
}
```

### 4. 运行开发服务器

```bash
npm run dev
```

之后，在浏览器中打开对应的 `localhost` 地址即可访问。

```
