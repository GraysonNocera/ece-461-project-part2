import { Component, OnInit } from '@angular/core';
import { PostService } from './posts.service';
@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent {
  constructor(public PostService: PostService) {}
  newPost = '';
  enteredValue = '';
  test = 'http://localhost:3000/';

  onAddPost(postInput: HTMLTextAreaElement) {
    this.newPost = 'http://localhost:3000' + postInput.value;
    this.test = this.newPost;
    console.log(this.test);
    this.PostService.addPost(this.test);
  }
  // ngOnInit() {
  //   this.refreshPost();
  // }
  // refreshPost() {
  //   this.PostService.addPost(this.test);
  // }
}
