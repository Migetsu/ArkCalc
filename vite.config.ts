import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/arknights/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1:5173'}`);
        const pathname = url.pathname;

        try {
          let bodyData = '';
          req.on('data', (chunk: any) => {
            bodyData += chunk;
          });
          await new Promise((resolve) => req.on('end', resolve));

          let parsedBody: any = {};
          if (bodyData) {
            try {
              parsedBody = JSON.parse(bodyData);
            } catch {
              parsedBody = {};
            }
          }
          req.body = parsedBody;

          const customRes = {
            setHeader: (k: string, v: string) => res.setHeader(k, v),
            status: (code: number) => {
              res.statusCode = code;
              return {
                json: (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                end: () => res.end(),
              };
            },
          };

          if (pathname === '/api/arknights/send-code') {
            const mod = await server.ssrLoadModule('/api/arknights/send-code.ts');
            return await mod.default(req, customRes);
          } else if (pathname === '/api/arknights/login-and-sync') {
            const mod = await server.ssrLoadModule('/api/arknights/login-and-sync.ts');
            return await mod.default(req, customRes);
          } else if (pathname === '/api/arknights/sync-with-token') {
            const mod = await server.ssrLoadModule('/api/arknights/sync-with-token.ts');
            return await mod.default(req, customRes);
          }

          next();
        } catch (err: any) {
          console.error('[API Dev Error]', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err?.message || 'Internal Dev Server Error' }));
        }
      });
    },
  };
}

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  plugins: [
    vercelApiDevPlugin(),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ARK-Calc - Arknights Planner',
        short_name: 'ARK-Calc',
        description: 'Offline-First Planner, Inventory and Resource Calculator for Arknights',
        theme_color: '#0e1117',
        background_color: '#080a0e',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'arknights-cdn-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'jsdelivr-cdn-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
