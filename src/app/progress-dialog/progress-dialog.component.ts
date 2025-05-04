import {Component, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogContent} from "@angular/material/dialog";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgIf} from "@angular/common";

@Component({
      selector: 'app-progress-dialog',
      standalone: true,
      imports: [MatButtonModule, MatDialogContent, MatProgressSpinner, NgIf],
      templateUrl: './progress-dialog.component.html',
      styleUrl: './progress-dialog.component.css'
})
export class ProgressDialogComponent {
      readonly action_name?: string

      constructor(@Inject(MAT_DIALOG_DATA) data: { action_name: string; }) {
            this.action_name = data.action_name;
      }

}
