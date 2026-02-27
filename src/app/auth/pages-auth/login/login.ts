import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {

  fb = inject(FormBuilder);

  hasError = signal(false);
  isPosting = signal(false);
  router = inject(Router);

  authService = inject(AuthService);

  loginForm = this.fb.group({
    usuario: ['admin', [Validators.required]],
    password: ['adminPassword12', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
  });


  onSubmit() {

    if (this.loginForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
      return;
    }

    const { usuario, password } = this.loginForm.value;

    // para mostrar resultado del formulario
    // console.log({ usuario, password });

    this.authService.login(usuario!, password!)
      .subscribe({
        next: (isAuthenticated) => {

          if (isAuthenticated) {
            console.log('Login exitoso');
            this.router.navigate(['/admin']);
          };

          this.hasError.set(true);
          setTimeout(() => {
            this.hasError.set(false);
          }, 2000);

        },
        error: (error) => {
          console.log(error);
        }
      });
  }
}
