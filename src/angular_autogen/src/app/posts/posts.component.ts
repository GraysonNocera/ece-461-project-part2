import { Component } from '@angular/core';
import { PostService } from './posts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent {
  constructor(public PostService: PostService) { }

  newPost = '';
  isLoggedIn = false;
  apiUrl = 'http://35.223.191.75:3000/';
  popupVisible = false;
  http_method = 'GET';

  addPost(postInput: HTMLTextAreaElement) {
    const authToken = localStorage.getItem('jwtToken_461_API');
    const requestUrl = `${this.apiUrl}${postInput.value}`;
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Authorization': `Bearer ${authToken}`,
    });

    this.sendRequest(requestUrl, requestHeaders, this.http_method);
  }

  authenticate(username: string, password: string) {
    const authUrl = `${this.apiUrl}authenticate`;
    alert('Authenticating at ' + authUrl);
    const authRequestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        User: {
          name: username,
          isAdmin: false,
          isSearch: false,
          isDownload: false,
          isUplaod: false,
        },
        Secret: {
          password: password,
        },
      }),
    };

    fetch(authUrl, authRequestOptions)
      .then((response) => {
        if (!response.ok) {
          alert('Authentication failed.');
          throw new Error('Authentication failed.');
        }
        return response.text();
      })
      .then((data) => {
        const newAuthToken = data;
        localStorage.setItem('jwtToken_461_API', newAuthToken);
        const requestUrl = `${this.apiUrl}${this.newPost}`;
        const requestHeaders = new Headers({
          'Content-Type': 'application/json',
          'X-Authorization': `Bearer ${newAuthToken}`,
        });
        this.isLoggedIn = true;
        alert('Authentication Successful');
        this.sendRequest(requestUrl, requestHeaders, this.http_method);
      })
      .catch((error) => {
        alert('Authentication Failed');
        console.error('Error:', error);
      });
  }

  sendRequest(requestUrl: string, requestHeaders: Headers, http_method: string, request_body?: string) {
    alert('Sending Request at ' + requestUrl);
    console.log(
      'Making request to URL:',
      requestUrl,
      'with headers:',
      requestHeaders
    );
    fetch(requestUrl, { 
      method: http_method,
      headers: requestHeaders,
      body : request_body || this.newPost 
    })
      .then((response) => {
        if (!response.ok) {
          alert('Request Failed');
          throw new Error('Request failed.');
        }
        try {
          return response.json();
        } catch (error) {
          return response.text();
        }
      })
      .then((data) => {
        console.log('Received response:', data);
        localStorage.setItem('base_64_package', JSON.stringify(data, null, 2));
        this.newPost = JSON.stringify(data, null, 2);
      })
      .catch((error) => {
        console.error('Error:', error);
        if (error.message === 'Request failed.') {
          alert(
            'Authentication Token Expired. Please enter username and password'
          );
          console.log(
            'Auth token expired. Prompting user to enter username and password.'
          );
        }
      });
  }

  login() {
    const username = (<HTMLInputElement>document.getElementById('username'))
      .value;
    const password = (<HTMLInputElement>document.getElementById('password'))
      .value;
    this.authenticate(username, password);
  }

  logout() {
    alert('Logging Out');
    localStorage.removeItem('jwtToken_461_API');
    this.isLoggedIn = false;
  }

  togglePopup() {
    this.popupVisible = !this.popupVisible;
  }

  create_user(): void {
    this.popupVisible = !this.popupVisible;
    const usernameInput = document.getElementById('new-username') as HTMLInputElement;
    const passwordInput = document.getElementById('new-user-password') as HTMLInputElement;
    const writePrivilegeInput = document.getElementById('write-privilege') as HTMLInputElement;
    const downloadPrivilegeInput = document.getElementById('download-privilege') as HTMLInputElement;
    const adminPrivilegeInput = document.getElementById('admin-privilege') as HTMLInputElement;
    const searchPrivilegeInput = document.getElementById('search-privilege') as HTMLInputElement;

    const username = usernameInput.value;
    const password = passwordInput.value;
    const privileges = [];

    if (writePrivilegeInput.checked) {
      privileges.push('write');
    }
    if (downloadPrivilegeInput.checked) {
      privileges.push('download');
    }
    if (adminPrivilegeInput.checked) {
      privileges.push('admin');
    }
    if (searchPrivilegeInput.checked) {
      privileges.push('search');
    }

    const requestBody = {
      User: {
        name: username,
        isAdmin: privileges.includes('admin'),
        isUpload: privileges.includes('write'),
        isDownload: privileges.includes('download'),
        isSearch: privileges.includes('search')
      },
      Secret: { password },
    };

    alert ("Creating user: \n" + JSON.stringify(requestBody, null, 2));

    var headers = new Headers({
      'Content-Type': 'application/json'});

    this.sendRequest (this.apiUrl + 'user', headers, 'POST', JSON.stringify(requestBody));
  }
}

