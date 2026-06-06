import {Component, computed, inject, input} from '@angular/core';
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
    imageState = input.required<ImageState>();
    image = computed(() => this.imageState().image)
    private readonly dialog = inject(MatDialog)

    openImage(): void {
        const image = this.image()
        if (!image.uri) return;
        this.dialog.open(ImageViewerDialogComponent, {
            data: {
                uri: image.uri,
                filename: image.filename,
            },
            panelClass: 'image-viewer-dialog',
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh'
        });
    }
}
