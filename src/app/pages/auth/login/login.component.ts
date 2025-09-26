import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@Component({
  selector: 'ic-login',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  public hidePassword?: boolean;
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(private auth: AuthService, private router: Router) {
    this.loginForm.reset();
    localStorage.clear();
  }
  async ngOnInit(): Promise<void> {
    localStorage.clear()
    this.hidePassword = true;
  }
  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      localStorage.setItem('userId', email);
      const success = this.auth.login(email, password);

      if (success) {
        this.router.navigate(['/tasks']);
      } else {
        this.errorMessage = 'Invalid credentials';
      }
    } else {
      this.errorMessage = 'Please fill in all fields correctly.';
    }
  }

}
