import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

// 监听认证状态变化
pb.authStore.onChange((auth) => {
  // 可以在这里处理认证状态变化（如更新全局状态）
  console.log('Auth state changed:', auth);
}, true);