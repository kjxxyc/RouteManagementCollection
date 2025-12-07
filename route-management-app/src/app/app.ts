import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('route-management-app');

  isDarkTheme = signal(true);

  routes: unknown[] = [];
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private readonly api: ApiService) {
    effect(() => {
      const theme = this.isDarkTheme() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', theme);
    });
  }

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getRoutes().subscribe({
      next: (data) => {
        this.routes = data ?? [];
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar rutas');
        this.loading.set(false);
      }
    });
  }

  toggleTheme(): void {
    this.isDarkTheme.update((value) => !value);
  }
}
