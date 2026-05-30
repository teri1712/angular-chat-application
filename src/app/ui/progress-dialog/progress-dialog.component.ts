import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
    selector: 'app-progress-dialog',
    standalone: true,
    imports: [],
    templateUrl: './progress-dialog.component.html',
    styleUrl: './progress-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressDialogComponent {
      readonly action_name?: string

      constructor(@Inject(MAT_DIALOG_DATA) data: { action_name: string; }) {
            this.action_name = data.action_name;
      }
}
