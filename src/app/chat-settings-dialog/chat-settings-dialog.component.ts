import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {Preference} from '../model/preference';
import {IconSelectionDialogComponent} from '../icon-selection-dialog/icon-selection-dialog.component';
import {ThemeSelectionDialogComponent} from '../theme-selection-dialog/theme-selection-dialog.component';
import {getIcon} from '../res/icons';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';

@Component({
      selector: 'app-chat-settings-dialog',
      templateUrl: './chat-settings-dialog.component.html',
      styleUrls: ['./chat-settings-dialog.component.css'],
      standalone: true,
      imports: [
            CommonModule,
            MatDialogModule,
            MatFormFieldModule,
            MatInputModule,
            FormsModule,
            MatButtonModule,
            MatIconModule,
            ScrollingModule,
      ],
})
export class ChatSettingsDialogComponent {
      preference: Preference;
      getIcon = getIcon;

      constructor(
              public dialogRef: MatDialogRef<ChatSettingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public dialog: MatDialog,
              private cdr: ChangeDetectorRef
      ) {
            this.preference = new Preference(
                    data.preference.resourceId,
                    data.preference.roomName,
                    data.preference.theme
            );
      }

      onNoClick(): void {
            this.dialogRef.close();
      }

      openIconSelectionDialog(): void {
            const dialogRef = this.dialog.open(IconSelectionDialogComponent, {
                  width: '250px'
            });

            dialogRef.afterClosed().subscribe(result => {
                  if (result) {
                        this.preference.resourceId = result;
                  }
                  this.cdr.markForCheck();
            });
      }

      openThemeSelectionDialog(): void {
            const dialogRef = this.dialog.open(ThemeSelectionDialogComponent, {
                  width: '500px'
            });

            dialogRef.afterClosed().subscribe(result => {
                  if (result) {
                        this.preference.theme = result;
                  }
                  this.cdr.markForCheck();
            });
      }

      submit() {
            this.dialogRef.close(this.preference);
      }
}
