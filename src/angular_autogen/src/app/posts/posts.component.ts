import { Component, OnInit } from '@angular/core';
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

  // onAddPost(postInput: HTMLTextAreaElement) {
  //   this.newPost = 'http://localhost:3000' + postInput.value;
  //   this.test = this.newPost;
  //   console.log(this.test);
  //   this.PostService.addPost(this.test);
  // }
  // // ngOnInit() {
  // //   this.refreshPost();
  // // }
  // // refreshPost() {
  // //   this.PostService.addPost(this.test);
  // // }

  /*
  onAddPost(postInput: HTMLTextAreaElement) {
    const apiUrl = 'http://localhost:3000';
    const authUrl = `${apiUrl}/authenticate`;
    const authToken = localStorage.getItem('jwtToken');
    const username = (<HTMLInputElement>document.getElementById('username')).value;
    const password = (<HTMLInputElement>document.getElementById('password')).value;
    this.newPost = 'http://localhost:3000' + postInput.value;
    this.test = this.newPost;
    console.log(this.test);
    

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
  
    const sendRequest = () => {
      const requestUrl = `${apiUrl}${postInput.value}`;
      const requestHeaders = {
        'Content-Type': 'application/json',
        'X-Authorization': `Bearer ${authToken}`
      };
      console.log('Making request to URL:', requestUrl, 'with auth token:', authToken);
      return fetch(requestUrl, { headers: requestHeaders });
    };
  
    if (!authToken) {
      console.log('No auth token found. Prompting user to enter username and password.');
      // Prompt user to enter username and password
      return;
    }
  
    console.log('Authenticating with username:', username, 'and password:', password);
  
    fetch(authUrl, authRequestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Authentication failed.');
        }
        return response.json();
      })
      .then(data => {
        const newAuthToken = data;
        localStorage.setItem('jwtToken', newAuthToken);
        return sendRequest();
      })
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
          // Prompt user to enter username and password
          localStorage.removeItem('jwtToken');
        }
      });
  }
  */

  onAddPost(postInput: HTMLTextAreaElement) {
    const apiUrl = 'http://localhost:3000';
    const authUrl = `${apiUrl}/authenticate`;
    const authToken = localStorage.getItem('jwtToken_461_API');
    
    const username = (<HTMLInputElement>document.getElementById('username')).value;
    const password = (<HTMLInputElement>document.getElementById('password')).value;
    
    this.newPost = 'http://localhost:3000' + postInput.value;
    this.test = this.newPost;
    console.log(this.test);

    const sendRequest = (requestHeaders: Headers) => {
      const requestUrl = `${apiUrl}${postInput.value}`;
      console.log('Making request to URL:', requestUrl, 'with auth token:', authToken);
      return fetch(requestUrl, { headers: requestHeaders });
    };

    if (authToken) {
      console.log('Auth token found in local storage:', authToken);
      const requestHeaders = new Headers({
        'Content-Type': 'application/json',
        'X-Authorization': `Bearer ${authToken}`
      });
      sendRequest(requestHeaders)
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
            const usernameInput = prompt('Please enter your username:');
            const passwordInput = prompt('Please enter your password:');
            const authRequestOptions = {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                User: {
                  name: usernameInput,
                  isAdmin: false
                },
                Secret: {
                  password: passwordInput
                }
              })
            };
            console.log('Authenticating with username:', usernameInput, 'and password:', passwordInput);
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
                const requestHeaders = new Headers({
                  'Content-Type': 'application/json',
                  'X-Authorization': `Bearer ${newAuthToken}`
                });
                sendRequest(requestHeaders)
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
                  });
              })
              .catch(error => {
                console.error('Error:', error);
              });
          }
        });
    } else {
      console.log('No auth token found in local storage. Prompting user to enter username and password.');
      const usernameInput = prompt('Please enter your username:');
      const passwordInput = prompt('Please enter your password:');
      const authRequestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User: {
            name: usernameInput,
            isAdmin: false
          },
          Secret: {
            password: passwordInput
          }
        })
      };
      console.log('Authenticating with username:', usernameInput, 'and password:', passwordInput);
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
          const requestHeaders = new Headers({
            'Content-Type': 'application/json',
            'X-Authorization': `Bearer ${newAuthToken}`
          });
          sendRequest(requestHeaders)
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
            });
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }
}  