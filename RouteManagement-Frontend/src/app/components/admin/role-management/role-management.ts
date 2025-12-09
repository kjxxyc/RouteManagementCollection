import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

interface UserRole {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-management.html',
  styleUrl: './role-management.scss',
})
export class RoleManagementComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  users = signal<UserRole[]>([
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'Admin', isActive: true },
    { id: 2, username: 'supervisor', email: 'supervisor@example.com', role: 'Supervisor', isActive: true },
    { id: 3, username: 'operator', email: 'operator@example.com', role: 'Operator', isActive: true },
  ]);

  roles = ['Admin', 'Supervisor', 'Operator', 'User'];
  
  selectedUser = signal<UserRole | null>(null);
  showForm = signal(false);
  searchTerm = signal('');

  ngOnInit(): void {
    // In a real application, load users from API
  }

  get filteredUsers() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.users();
    
    return this.users().filter(user => 
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  editUser(user: UserRole): void {
    this.selectedUser.set({ ...user });
    this.showForm.set(true);
  }

  saveUser(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.users.update(users => 
      users.map(u => u.id === user.id ? user : u)
    );

    this.toastService.success('Rol actualizado exitosamente');
    this.closeForm();
  }

  toggleUserStatus(user: UserRole): void {
    this.users.update(users => 
      users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u)
    );
    
    const status = user.isActive ? 'desactivado' : 'activado';
    this.toastService.success(`Usuario ${status} exitosamente`);
  }

  closeForm(): void {
    this.selectedUser.set(null);
    this.showForm.set(false);
  }
}
