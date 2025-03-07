import { bootstrapApplication } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import "@angular/compiler";

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
