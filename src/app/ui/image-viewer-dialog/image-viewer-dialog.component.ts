import {Component, Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

export interface ImageViewerData {
      uri: string;
      filename?: string;
}

@Component({
      selector: 'app-image-viewer-dialog',
      standalone: true,
      imports: [CommonModule, MatDialogModule, MatButtonModule],
      templateUrl: './image-viewer-dialog.component.html',
      styleUrl: './image-viewer-dialog.component.css'
})
export class ImageViewerDialogComponent {
      constructor(
              public dialogRef: MatDialogRef<ImageViewerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ImageViewerData
      ) {
      }

      close(): void {
            this.dialogRef.close();
      }
}
