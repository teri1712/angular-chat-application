import {Component, Input} from '@angular/core';
import {ImageState} from "../../model/dto/image-state";
import {CommonModule} from "@angular/common";
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ImageViewerDialogComponent} from "../image-viewer-dialog/image-viewer-dialog.component";

@Component({
      selector: 'app-image-message',
      imports: [CommonModule, MatDialogModule],
      templateUrl: './image-message.component.html',
      styleUrl: './image-message.component.css'
})
export class ImageMessageComponent {
      @Input({required: true}) imageState!: ImageState;

      constructor(private dialog: MatDialog) {
      }

      openImage(): void {
            const image = this.imageState.image
            if (!image.uri) return;
            this.dialog.open(ImageViewerDialogComponent, {
                  data: {
                        uri: image.uri,
                        filename: image.filename,
                  },
                  width: '95vw',
                  maxWidth: '95vw',
                  height: '95vh',
                  maxHeight: '95vh'
            });
      }
}
