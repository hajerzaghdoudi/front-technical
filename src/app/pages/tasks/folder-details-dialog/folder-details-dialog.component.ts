import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../task.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { FileUploadZoneComponent } from '../../../components/file-upload-zone/file-upload-zone.component';

@Component({
  selector: 'app-folder-details-dialog',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FileUploadZoneComponent],
  templateUrl: './folder-details-dialog.component.html',
  styleUrls: ['./folder-details-dialog.component.scss']
})
export class FolderDetailsDialogComponent {
  folder: any;
  folderPath: string = '';
  activeFolder: any;
  files: any[] = [];
  subfolders: any[] = [];
  showSubfoldersOnly: boolean = false;
  initialFolder: any;
  subfolderFiles: { [folderId: string]: any[] } = {};
  visibleSubfolderFiles: { [folderId: string]: boolean } = {};
  previewContent: { [key: string]: string } = {};
  newFiles: File[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FolderDetailsDialogComponent>,
    private taskService: TaskService,
    private dialog: MatDialog
  ) {
    this.folder = data.folder;
    this.activeFolder = data.folder;
    this.initialFolder = data.folder;
    this.taskService.getPath(this.folder.id).subscribe({
      next: res => {
        this.folderPath = res.items.map(i => i.id).join(' / ');
      },
      error: err => console.error('Erreur chargement du chemin', err)
    });

    this.loadFiles();
  }
  loadFiles() {
    this.taskService.getItems(this.activeFolder.id).subscribe({
      next: res => {
        const items = res.items;
        this.subfolders = items.filter(i => i.folder && i.parentId === this.activeFolder.id);
        this.files = items.filter(i => !i.folder && i.parentId === this.activeFolder.id);

        // Charger les fichiers de chaque sous-dossier
        for (let folder of this.subfolders) {
          this.taskService.getItems(folder.id).subscribe({
            next: subRes => {
              const subFiles = subRes.items.filter(i => !i.folder && i.parentId === folder.id);
              this.subfolderFiles[folder.id] = subFiles;
            }
          });
        }
      }
    });
  }




  uploadFiles(event: any) {
    const formData = new FormData();
    for (let file of event.target.files) {
      formData.append('files', file);
    }
    formData.append('parentId', this.folder.id);

    this.taskService.uploadFiles(formData).subscribe({
      next: () => this.loadFiles(),
      error: err => console.error('Erreur upload', err)
    });
  }

  deleteFile(file: any) {
    if (!confirm(`Supprimer le fichier "${file.name}" ?`)) return;
    this.taskService.deleteItem(file.id).subscribe({
      next: () => this.loadFiles(),
      error: err => console.error('Erreur suppression', err)
    });
  }

  downloadFile(file: any) {
    this.taskService.downloadFile(file.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  loadPreview(file: any) {
    if (file.mimeType.startsWith('image/')) {
      this.taskService.downloadFile(file.id).subscribe(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewContent[file.id] = reader.result as string;
        };
        reader.readAsDataURL(blob);
      });
    } else if (file.mimeType === 'text/plain') {
      this.taskService.downloadFile(file.id).subscribe(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewContent[file.id] = reader.result as string;
        };
        reader.readAsText(blob);
      });
    }
  }
  handleDrop(event: DragEvent) {
    event.preventDefault();

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    formData.append('parentId', this.folder.id);

    this.taskService.uploadFiles(formData).subscribe({
      next: () => this.loadFiles(),
      error: err => console.error('Erreur upload', err)
    });
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }
  moveFile(file: any) {
    const targetId = prompt('ID du dossier cible :');
    if (!targetId || targetId === this.folder.id) return;

    this.taskService.moveItem(file.id, targetId.trim()).subscribe({
      next: () => this.loadFiles(),
      error: err => console.error('Erreur déplacement', err)
    });
  }
  openFolderDetails(folder: any) {
    const dialogRef = this.dialog.open(FolderDetailsDialogComponent, {
      width: '600px',
      data: { folder }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadFiles(); // recharge le dossier courant si nécessaire
    });
  }
  viewFolder(folder: any) {
    this.activeFolder = folder;
    this.loadFiles();
  }
  getFolderName(folderId: string): string {
    const folder = this.subfolders.find(f => f.id === folderId);
    return folder?.name || 'Dossier inconnu';
  }
  showSubfolders: boolean = false;

  toggleSubfolderView() {
    this.showSubfolders = !this.showSubfolders;
  }
  toggleSubfolderFiles(folderId: string) {
    this.visibleSubfolderFiles[folderId] = !this.visibleSubfolderFiles[folderId];
  }


  onFilesReceived(files: File[]) {
    this.newFiles = [...this.newFiles, ...files];

    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    formData.append('parentId', this.folder.id);

    this.taskService.uploadFiles(formData).subscribe({
      next: () => this.loadFiles(),
      error: err => console.error('Erreur upload', err)
    });
  }
  validateNewFiles() {
    this.newFiles = [];
    this.dialogRef.close(); // ou une autre action selon ton besoin
  }



}
