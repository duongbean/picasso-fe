import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import "@angular/compiler";
// Cấu hình SSR cho Cloudflare Workers
const bootstrap = () => bootstrapApplication(AppComponent, {
  ...config,
  providers: [provideServerRendering()]
});

export default bootstrap;
