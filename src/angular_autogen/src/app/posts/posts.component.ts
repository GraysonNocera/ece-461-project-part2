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
  apiUrl = 'http://35.223.191.75:3000/';
  http_method = 'GET';
  
  
  popupVisible = false;
  isLoggedIn = true;
  package_view = false;
  packages_view = false;
  edit_user_view = false;

  addPost(postInput: HTMLTextAreaElement) {
    const authToken = localStorage.getItem('jwtToken_461_API');
    const requestUrl = `${this.apiUrl}${postInput.value}`;

    this.sendRequest(requestUrl, this.http_method);
  }

  authenticate(username: string, password: string) {
    const authUrl = `${this.apiUrl}authenticate`;
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
        this.isLoggedIn = true;
        // alert('Authentication Successful');
      })
      .catch((error) => {
        alert('Authentication Failed');

        console.error('Error:', error);
      });
  }

  sendRequest(requestUrl: string, http_method: string, request_body?: string) {
    alert('Sending Request at ' + requestUrl);

    let requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Authorization': `Bearer ${localStorage.getItem('jwtToken_461_API')}`
    });


    fetch(requestUrl, {
      method: http_method,
      headers: requestHeaders,
      body: request_body || this.newPost
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
          this.logout();
        }
      });
  }

  login() {
    const username = (<HTMLInputElement>document.getElementById('username'))
      .value;
    const password = (<HTMLInputElement>document.getElementById('password'))
      .value;

    localStorage.removeItem('jwtToken_461_API');

    this.authenticate(username, password);
  }

  logout() {
    // alert('Logging Out');
    localStorage.removeItem('jwtToken_461_API');
    this.isLoggedIn = false;
    this.package_view = false;
    this.packages_view = false;
    this.edit_user_view = false;
  }

  togglePopup(type:string) {
    if (type === 'user_edit') {
      this.package_view = false;
      this.packages_view = false;
      this.edit_user_view = true;
    }

    if (type === 'rm_edit_user') {
      this.edit_user_view = false;
    }

    if (type === 'package') {
      this.package_view = true;
      this.packages_view = false;
      this.edit_user_view = false;
    }
  }

  modify_user(method:string): void {
    this.popupVisible = !this.popupVisible;
    const usernameInput = document.getElementById('username-to-modify') as HTMLInputElement;
    const passwordInput = document.getElementById('password-to-modify') as HTMLInputElement;
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

    // alert("Creating user: \n" + JSON.stringify(requestBody, null, 2));

    this.sendRequest(this.apiUrl + 'user', method, JSON.stringify(requestBody));
  }
}
