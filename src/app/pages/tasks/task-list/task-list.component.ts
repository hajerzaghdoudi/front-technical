import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core'; import { TaskService } from '../task.service';
import { MaterialModule } from '../../../shared/material.module';
import { FolderDetailsDialogComponent } from '../folder-details-dialog/folder-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputDialogComponent } from '../../../components/input-dialog/input-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  parentId: string | null = null;
  breadcrumb: any[] = [];
  displayedColumns: string[] = ['Id', 'name', 'fileCount', 'actions'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadItems();
    this.route.paramMap.subscribe(params => {
      this.parentId = params.get('parentId');
      this.loadItems();
      //this.loadBreadcrumb();
    });
  }

  loadItems__() {
    this.taskService.getItems(this.parentId || undefined).subscribe({
      next: res => {
        this.tasks = res.items;
        const folders = this.tasks.filter(item => item.folder);
        this.dataSource = new MatTableDataSource(folders);
        this.dataSource.paginator = this.paginator;
      },
      error: err => console.error('Erreur chargement', err)
    });
  }
  loadItems() {
    this.taskService.getItems(this.parentId || undefined).subscribe({
      next: res => {
        this.tasks = res.items;
        const folders = this.tasks.filter(item => item.folder && item.parentId === this.parentId);
        this.dataSource = new MatTableDataSource(folders);
        this.dataSource.paginator = this.paginator;
      }
    });
  }


  loadBreadcrumb() {
    if (!this.parentId) {
      this.breadcrumb = [];
      return;
    }
    this.taskService.getPath(this.parentId).subscribe(res => {
      this.breadcrumb = res.items;
    });
  }

  countFilesInFolder(folderId: string): number {
    return this.tasks.filter(item => item.parentId === folderId && !item.folder).length;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  navigateToFolder(id: string) {
    this.router.navigate(['/tasks', id]);
  }

  createFolder() {
    const name = prompt('Nom du dossier :');
    if (!name) return;
    this.taskService.createItem({ name, folder: true, parentId: this.parentId || null }).subscribe(() => {
      this.loadItems();
    });
  }

  createFolderAndUpload() {
    const name = prompt('Nom du nouveau dossier :');
    if (!name) return;
    const newItem = { name: name.trim(), folder: true, parentId: this.parentId || null };
    this.taskService.createItem(newItem).subscribe({
      next: (res) => {
        const folderId = res.item.id;
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (event: any) => {
          const files = event.target.files;
          const formData = new FormData();
          for (let file of files) formData.append('files', file);
          formData.append('parentId', folderId);
          this.taskService.uploadFiles(formData).subscribe(() => this.loadItems());
        };
        input.click();
      },
      error: err => console.error('Erreur création dossier', err)
    });
  }

  renameItem(item: any) {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: {
        title: 'Renommer le dossier',
        label: 'Nouveau nom'
      }
    });

    dialogRef.afterClosed().subscribe(newName => {
      if (!newName || newName.trim() === item.name) return;

      this.taskService.renameItem(item.id, { name: newName.trim() }).subscribe(() => {
        this.loadItems();
        this.snackBar.open('Nom mis à jour ✅', 'Fermer', { duration: 3000 });
      });
    });
  }
  moveItem(item: any) {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: {
        title: 'Déplacer le dossier',
        label: 'ID du dossier cible'
      }
    });

    dialogRef.afterClosed().subscribe(targetId => {
      if (targetId?.trim()) {
        this.taskService.moveItem(item.id, targetId.trim()).subscribe(() => {
          this.loadItems();
          this.snackBar.open('Élément déplacé ✅', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  deleteItemWithConfirmation(id: string) {
    const snackBarRef = this.snackBar.open('Confirmer la suppression ?', 'Supprimer', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['confirm-snackbar']
    });

    snackBarRef.onAction().subscribe(() => {
      this.taskService.deleteItem(id).subscribe(() => {
        this.loadItems();
        this.snackBar.open('Dossier supprimé avec succès ✅', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      });
    });
  }

  uploadFiles(event: any) {
    const files = event.target.files;
    const formData = new FormData();
    for (let file of files) formData.append('files', file);
    if (this.parentId) formData.append('parentId', this.parentId);
    this.taskService.uploadFiles(formData).subscribe(() => this.loadItems());
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files) return;
    const formData = new FormData();
    for (let file of files) formData.append('files', file);
    if (this.parentId) formData.append('parentId', this.parentId);
    this.taskService.uploadFiles(formData).subscribe(() => this.loadItems());
  }

  downloadItem(item: any) {
    this.taskService.downloadFile(item.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  openFolderDetails(folder: any) {
    const dialogRef = this.dialog.open(FolderDetailsDialogComponent, {
      width: '600px',
      data: { folder }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadItems();
    });
  }

}