import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'ic-input-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './input-dialog.component.html',
  styleUrl: './input-dialog.component.scss'
})
export class InputDialogComponent {
  inputValue: string = '';

  constructor(
    public dialogRef: MatDialogRef<InputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; label: string }
  ) { }
}
