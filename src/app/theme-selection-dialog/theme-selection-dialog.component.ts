import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {Theme} from '../model/theme';
import {MatListModule} from '@angular/material/list';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {PreferenceService} from '../usecases/service/preference.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
      selector: 'app-theme-selection-dialog',
      templateUrl: './theme-selection-dialog.component.html',
      styleUrls: ['./theme-selection-dialog.component.css'],
      standalone: true,
      imports: [
            CommonModule,
            MatDialogModule,
            MatListModule,
            MatButtonModule,
            MatProgressSpinnerModule,

      ],
})
export class ThemeSelectionDialogComponent implements OnInit {
      themes: Theme[] = [];
      isLoading = true;

      constructor(
              public dialogRef: MatDialogRef<ThemeSelectionDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private preferenceService: PreferenceService
      ) {
      }

      ngOnInit(): void {
            this.preferenceService.getThemes().subscribe((themes) => {
                  this.themes = themes;
                  this.isLoading = false;
            });
      }

      onNoClick(): void {
            this.dialogRef.close();
      }

      selectTheme(theme: Theme): void {
            this.dialogRef.close(theme);
      }
}
