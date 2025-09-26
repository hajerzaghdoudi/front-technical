import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../task.service';
import { MaterialModule } from '../../../shared/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadZoneComponent } from '../../../components/file-upload-zone/file-upload-zone.component';

@Component({
  selector: 'ic-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule, FileUploadZoneComponent],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent {
  folderName = '';
  parentId: string | null = null;
  uploadError: string | null = null;
  selectedFiles: File[] = [];
  selectedFileLabel: string = 'Select file';
  constructor(
    private taskService: TaskService,
    public router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar

  ) {
    this.route.queryParamMap.subscribe(params => {
      this.parentId = params.get('parentId');
    });
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }



  onFileSelected(event: Event) {


    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.selectedFileLabel = files.length === 1
        ? files[0].name
        : `${files.length} files selected`;
    } else {
      this.selectedFileLabel = 'No file selected';
    }
    if (files) {
      this.selectedFiles = [...this.selectedFiles, ...files];
      this.cdr.detectChanges();
    }
  }
  deleteFile(index: any) {
    this.selectedFiles.splice(index, 1);
  }
  handleDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.selectedFiles = [...this.selectedFiles, ...files];
      this.cdr.detectChanges();
    }
  }

  createFolderAndUpload() {
    if (!this.folderName.trim() || this.selectedFiles.length === 0) {
      this.uploadError = 'Veuillez entrer un nom de dossier et sélectionner des fichiers.';
      return;
    }

    const newItem = {
      name: this.folderName.trim(),
      folder: true,
      parentId: this.parentId || null
    };

    this.taskService.createItem(newItem).subscribe({
      next: (res) => {
        const folderId = res.item.id;
        const formData = new FormData();
        this.selectedFiles.forEach(file => formData.append('files', file));
        formData.append('parentId', folderId);

        this.taskService.uploadFiles(formData).subscribe({
          next: () => this.router.navigate(['/tasks']),
          error: err => this.uploadError = 'Erreur lors de l\'upload des fichiers.'
        });
      },
      error: err => this.uploadError = 'Erreur lors de la création du dossier.'
    });
  }
  onFilesReceived(files: File[]) {
    this.selectedFiles = [...this.selectedFiles, ...files];
    this.selectedFileLabel = files.length === 1
      ? files[0].name
      : `${files.length} files selected`;
    this.cdr.detectChanges();
  }


  getErrorMessage(err: any): string {
    if (err.status === 409 || err.status === 400) {
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
