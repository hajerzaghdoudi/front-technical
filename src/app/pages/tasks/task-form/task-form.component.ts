import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../task.service';
import { MaterialModule } from '../../../shared/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'ic-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent {
  name = '';
  isFolder = true;
  parentId: string | null = null;
  uploadError: string | null = null
  constructor(private taskService: TaskService, private router: Router, private route: ActivatedRoute,  private snackBar: MatSnackBar) {
    this.route.queryParamMap.subscribe((params: any) => {
      this.parentId = params.get('parentId');
    });
  }

  submit() {
    const newItem = {
      name: this.name,
      folder: this.isFolder,
      parentId: this.parentId || undefined
    };

    this.taskService.createItem(newItem).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: err => console.error('Erreur création', err)
    });
  }

  uploadFiles(event: any) {
  this.uploadError = null;
  const files = event.target.files;
  const formData = new FormData();

  for (let file of files) {
    formData.append('files', file);
  }

  if (this.parentId) {
    formData.append('parentId', this.parentId);
  }

  this.taskService.uploadFiles(formData).subscribe({
    next: () => {
      this.snackBar.open('✅ Upload completed', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/tasks']);
    },
    error: err => {
      this.snackBar.open(`❌ ${err?.error?.errors[0].message}` , 'Close', {
        duration: 4000,
        panelClass: ['snackbar-error']
      });
    }
  });
}
  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.uploadError = null;
    const files = event.dataTransfer?.files;
    if (!files) return;

    const formData = new FormData();
    for (let file of files) formData.append('files', file);
    if (this.parentId) formData.append('parentId', this.parentId);

    this.taskService.uploadFiles(formData).subscribe({
      next: () => {
        this.snackBar.open('✅ Upload completed', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/tasks']);
      },
      error: err => {
        this.snackBar.open(`❌ ${err?.error?.errors[0].message}` , 'Close', {
        duration: 4000,
        panelClass: ['snackbar-error']
      });
      }
    });
  }
  getErrorMessage(err: any): string {
    if (err.status === 409) {
      return err.error?.desc || 'Conflit : nom déjà utilisé.';
    }
    if (err.status === 400) {
      return err.error?.desc || 'Conflit : nom déjà utilisé.';
    }
    if (err.status === 413) {
      return 'Le fichier dépasse la limite de 10 Mo.';
    }
    if (err.status === 500) {
      return 'Erreur serveur. Réessaie plus tard.';
    }
    return 'Erreur inconnue lors de l’upload.';
  }
}
