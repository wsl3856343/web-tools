import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'


// // TODO: 将此处替换为您从 Firebase 控制台获取的真实配置
// const firebaseConfig = {
//   // apiKey: "YOUR_API_KEY",
//   // authDomain: "YOUR_AUTH_DOMAIN",
//   // databaseURL: "YOUR_DATABASE_URL",
//   // projectId: "YOUR_PROJECT_ID",
//   // storageBucket: "YOUR_STORAGE_BUCKET",
//   // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   // appId: "YOUR_APP_ID"
//   apiKey: "AIzaSyBZQR9Lr0waoWKRw3nhv8IODt050_aMhkU",
//   authDomain: "webtool-b3a74.firebaseapp.com",
//   databaseURL: "https://webtool-b3a74-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "webtool-b3a74",
//   storageBucket: "webtool-b3a74.firebasestorage.app",
//   messagingSenderId: "408158693156",
//   appId: "1:408158693156:web:028b6b9061f8ba1b03b5b1",
//   measurementId: "G-927VZ7LHDD"
// };


// 使用 Vite 的 import.meta.env 来访问环境变量
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 采用幂等方式初始化，防止热更新导致的问题
// 这是解决 `_checkNotDeleted` 错误的关键
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)

// 获取实时数据库的实例，这是我们功能所需要的
const db = getDatabase(app)

// 导出数据库实例供其他文件使用
export { db }