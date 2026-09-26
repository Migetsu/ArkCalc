import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';

// Register Service Worker for PWA
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New content available, reload to update.');
  },
  onOfflineReady() {
    console.log('App ready to work offline.');
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');
