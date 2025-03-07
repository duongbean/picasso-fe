import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css',
})
export class ConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<ConfirmationDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false); // Trả về false nếu hủy bỏ
  }

  onConfirm(): void {
    this.dialogRef.close(true); // Trả về true nếu đồng ý
  }
}
