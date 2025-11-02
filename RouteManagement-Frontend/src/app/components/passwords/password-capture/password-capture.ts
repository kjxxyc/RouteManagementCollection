import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordService } from '../../../services/password.service';
import { RouteService } from '../../../services/route.service';
import { ToastService } from '../../../services/toast.service';
import { CapturePasswordRequest } from '../../../models/password.model';
import { Route } from '../../../models/route.model';

@Component({
  selector: 'app-password-capture',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-capture.html',
  styleUrl: './password-capture.scss',
})
export class PasswordCaptureComponent implements OnInit {
  private passwordService = inject(PasswordService);
  private routeService = inject(RouteService);
  private toastService = inject(ToastService);

  routes = signal<Route[]>([]);
  loading = signal(false);
  
  formData = signal<CapturePasswordRequest>({
    routeId: 0,
    passwordValue: ''
  });

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.routeService.getAll(undefined, undefined, undefined, 1, 100).subscribe({
      next: (data) => {
        this.routes.set(data.items);
      }
    });
  }

  onSubmit(): void {
    if (!this.formData().routeId) {
      this.toastService.warning('Seleccione una ruta');
      return;
    }

    this.loading.set(true);
    this.passwordService.capture(this.formData()).subscribe({
      next: () => {
        this.toastService.success('Contraseña capturada exitosamente');
        this.formData.set({ routeId: 0, passwordValue: '' });
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Error al capturar contraseña');
        this.loading.set(false);
      }
    });
  }
}
