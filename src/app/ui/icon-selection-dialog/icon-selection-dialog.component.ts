import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {messageIconBundles} from '../../res/icons';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

@Component({
      selector: 'app-icon-selection-dialog',
      templateUrl: './icon-selection-dialog.component.html',
      styleUrls: ['./icon-selection-dialog.component.css'],
      standalone: true,
      imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
      changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconSelectionDialogComponent {
      icons = messageIconBundles;

      constructor(
              public dialogRef: MatDialogRef<IconSelectionDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
      ) {
      }

      onNoClick(): void {
            this.dialogRef.close();
      }
}
