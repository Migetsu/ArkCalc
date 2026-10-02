import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { usePwaStore } from './stores/pwa';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Initialize PWA offline listener and service worker management
const pwaStore = usePwaStore();
pwaStore.initPwa();

app.mount('#app');
