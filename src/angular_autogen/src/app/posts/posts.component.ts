import { Component } from '@angular/core';
import { PostService } from './posts.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent {
  constructor(public PostService: PostService) { }

  newPost = '';
  enteredValue = '';
  test = 'http://localhost:3000/';
  isLoggedIn = false;

  addPost(postInput: HTMLTextAreaElement) {
    const apiUrl = 'http://localhost:3000';
    const authToken = localStorage.getItem('jwtToken_461_API');
    const requestUrl = `${apiUrl}${postInput.value}`;
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Authorization': `Bearer ${authToken}`
    });


    console.log (requestUrl);

    this.sendRequest(requestUrl, requestHeaders);
  }

  authenticate(username: string, password: string) {
    const apiUrl = 'http://localhost:3000';
    const authUrl = `${apiUrl}/authenticate`;
    const authRequestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        User: {
          name: username,
          isAdmin: false
        },
        Secret: {
          password: password
        }
      })
    };
    const requestHeaders = new Headers({
      'Content-Type': 'application/json'
    });

    fetch(authUrl, authRequestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Authentication failed.');
        }
        return response.json();
      })
      .then(data => {
        const newAuthToken = data;
        localStorage.setItem('jwtToken_461_API', newAuthToken);
        const requestUrl = `${apiUrl}${this.newPost}`;
        const requestHeaders = new Headers({
          'Content-Type': 'application/json',
          'X-Authorization': `Bearer ${newAuthToken}`
        });
        this.isLoggedIn = true;
        this.sendRequest(requestUrl, requestHeaders);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  sendRequest(requestUrl: string, requestHeaders: Headers) {
    console.log('Making request to URL:', requestUrl, 'with headers:', requestHeaders);
    fetch(requestUrl, { headers: requestHeaders })
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed.');
        }
        return response.json();
      })
      .then(data => {
        console.log('Received response:', data);
        this.newPost = JSON.stringify(data, null, 2);
      })
      .catch(error => {
        console.error('Error:', error);
        if (error.message === 'Request failed.') {
          console.log('Auth token expired. Prompting user to enter username and password.');
          // const usernameInput = prompt('Please enter your username:');
          // const passwordInput = prompt('Please enter your password:');
          // this.authenticate(usernameInput, passwordInput);

          alert ("Authentication Token Expired. Please enter username and password");
        }
      });
  }

  login() {
    const username = (<HTMLInputElement>document.getElementById('username')).value;
    const password = (<HTMLInputElement>document.getElementById('password')).value;
    alert ("Logging In: Username - " + username + " Password - " + password );
    this.authenticate(username, password);
    this.isLoggedIn = true;
  }

  logout() {
    alert ("Logging Out");
    localStorage.removeItem('jwtToken_461_API');
    this.isLoggedIn = false;  
  }
}
