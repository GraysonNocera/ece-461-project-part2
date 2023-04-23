import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PostsComponent } from './posts/posts.component';
import { FormsModule } from '@angular/forms';
import { PostService } from './posts/posts.service';
import { HttpClientModule } from '@angular/common/http';
import { HelpComponent } from './help/help.component';

@NgModule({
  declarations: [AppComponent, PostsComponent, HelpComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent, PostService],
})
export class AppModule {}
