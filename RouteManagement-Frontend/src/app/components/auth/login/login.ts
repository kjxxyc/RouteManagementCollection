import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { LoginRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  credentials = signal<LoginRequest>({ username: '', password: '' });
  loading = signal(false);

  onSubmit(): void {
    this.loading.set(true);
    this.authService.login(this.credentials()).subscribe({
      next: () => {
        this.toastService.success('Inicio de sesión exitoso');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.toastService.error('Credenciales inválidas');
        this.loading.set(false);
      }
    });
  }
}
