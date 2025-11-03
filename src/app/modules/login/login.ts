import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  constructor(private router: Router) {}

  sendToRegister(event: Event) {
    event.preventDefault();
    this.router.navigate(['registro']);
  }
  
  onLogin() {}
}
