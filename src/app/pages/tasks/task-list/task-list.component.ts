import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../task.service';
import { MaterialModule } from '../../../shared/material.module';

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

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params: any) => {
      this.parentId = params.get('parentId');
      this.loadItems();
    });
  }

  loadItems() {
    this.taskService.getItems(this.parentId || undefined).subscribe({
      next: res => this.tasks = res.items,
      error: err => console.error('Erreur chargement', err)
    });
  }

  navigateToFolder(id: string) {
    this.router.navigate(['/tasks', id]);
  }

  createFolder() {
    const name = prompt('Nom du dossier :');
    if (!name) return;
    this.taskService.createItem({ name, folder: true, parentId: this.parentId || undefined }).subscribe(() => this.loadItems());
  }

  renameItem(item: any) {
    const newName = prompt('Nouveau nom :', item.name);
    if (!newName || newName === item.name) return;
    this.taskService.renameItem(item.id, { name: newName }).subscribe(() => this.loadItems());
  }

  moveItem(item: any) {
    const targetId = prompt('ID du dossier cible :');
    if (!targetId) return;
    this.taskService.renameItem(item.id, { parentId: targetId }).subscribe(() => this.loadItems());
  }

  deleteItem(id: string) {
    if (!confirm('Confirmer la suppression ?')) return;
    this.taskService.deleteItem(id).subscribe(() => this.loadItems());
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
}
