import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'ic-file-upload-zone',
  imports: [CommonModule, RouterModule, MaterialModule],
  standalone: true,
  templateUrl: './file-upload-zone.component.html',
  styleUrls: ['./file-upload-zone.component.scss']
})
export class FileUploadZoneComponent {
  @Output() filesSelected = new EventEmitter<File[]>();

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.filesSelected.emit(Array.from(files));
    }
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.filesSelected.emit(Array.from(files));
    }
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

}
