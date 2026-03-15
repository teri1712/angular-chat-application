import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {IconSelectionDialogComponent} from '../icon-selection-dialog/icon-selection-dialog.component';
import {ThemeSelectionDialogComponent} from '../theme-selection-dialog/theme-selection-dialog.component';
import {getIcon} from '../../res/icons';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {PreferenceRequest} from "../../service/preference.service";

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
            ReactiveFormsModule,
            MatButtonModule,
            MatIconModule,
            ScrollingModule,
      ],
})
export class ChatSettingsDialogComponent {
      form: FormGroup;

      private request: PreferenceRequest = {}

      constructor(
              public dialogRef: MatDialogRef<ChatSettingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public dialog: MatDialog,
              private cdr: ChangeDetectorRef,
              private fb: FormBuilder
      ) {
            this.form = this.fb.group({
                  customName: [this.data.preference.customName ?? '', [Validators.pattern(/.*[\w]+.*/)]],
                  icon: getIcon(data.preference.iconId),
            });
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
                        this.form.patchValue({icon: getIcon(result)});
                        this.request.iconId = result;
                  }
                  this.cdr.markForCheck();
            });
      }

      openThemeSelectionDialog(): void {
            const dialogRef = this.dialog.open(ThemeSelectionDialogComponent, {
                  width: '500px'
            });

            dialogRef.afterClosed().subscribe(result => {
                  if (result)
                        this.request.themeId = result;
                  this.cdr.markForCheck();
            });
      }

      submit() {
            if (this.form.valid) {
                  this.request.customName = this.form.value.customName;
                  this.dialogRef.close(this.request);
            }
      }
}
