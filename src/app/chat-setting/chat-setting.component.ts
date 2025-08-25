import {Component, Input} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {Chat} from '../model/chat';
import {ChatSettingsDialogComponent} from '../chat-settings-dialog/chat-settings-dialog.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {PreferenceService} from '../usecases/service/preference.service';
import {Preference} from '../model/preference';

@Component({
      selector: 'app-chat-setting',
      templateUrl: './chat-setting.component.html',
      styleUrls: ['./chat-setting.component.css'],
      standalone: true,
      imports: [MatButtonModule, MatIconModule, MatDialogModule]
})
export class ChatSettingComponent {
      @Input() chat!: Chat;

      constructor(
              public dialog: MatDialog,
              private preferenceService: PreferenceService
      ) {
      }

      get isPreferenceDefined(): boolean {
            return !!this.chat.preference;
      }

      openSettingsDialog(): void {
            const dialogRef = this.dialog.open(ChatSettingsDialogComponent, {
                  data: {preference: this.chat.preference}
            });

            dialogRef.afterClosed().subscribe((result: Preference | undefined) => {
                  if (result) {
                        this.preferenceService.updatePreference(this.chat.identifier, result)
                  }
            });
      }
}
