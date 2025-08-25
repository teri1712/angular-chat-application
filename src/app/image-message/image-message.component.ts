import {Component, Input} from '@angular/core';
import {ImageEvent} from "../model/image-event";
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
      @Input({required: true}) imageEvent!: ImageEvent;

      constructor(private dialog: MatDialog) {
      }

      openImage(): void {
            if (!this.imageEvent?.imageSpec?.uri) return;
            this.dialog.open(ImageViewerDialogComponent, {
                  data: {
                        uri: this.imageEvent.imageSpec.uri,
                        filename: this.imageEvent.imageSpec.filename
                  },
                  width: '95vw',
                  maxWidth: '95vw',
                  height: '95vh',
                  maxHeight: '95vh'
            });
      }
}
