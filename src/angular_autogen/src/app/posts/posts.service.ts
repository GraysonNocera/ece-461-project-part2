import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: string = '';
  private responseData: string = '';
  constructor(private http: HttpClient) {}
  getPosts() {
    return [...this.posts];
  }

  addPost(post: string) {
    this.http
      .post(post, {
        Content: 'This is a test',
        URL: 'https://github.com/winstonjs/winston',
        JSProgram: "console.log('Hello World')",
      })
      .subscribe((responseData) => {
        this.responseData = responseData.toString();
        console.log(responseData);
      });
  }
}
