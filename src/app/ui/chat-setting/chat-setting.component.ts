import {Component, Input} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ChatSettingsDialogComponent} from '../chat-settings-dialog/chat-settings-dialog.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {PreferenceService} from '../../service/preference.service';
import {Preference} from '../../model/dto/preference';
import {IDialog} from "../../model/IDialog";

@Component({
      selector: 'app-chat-setting',
      templateUrl: './chat-setting.component.html',
      styleUrls: ['./chat-setting.component.css'],
      standalone: true,
      imports: [MatButtonModule, MatIconModule, MatDialogModule]
})
export class ChatSettingComponent {
      @Input() dialog!: IDialog;

      constructor(
              public matDialog: MatDialog,
              private preferenceService: PreferenceService
      ) {
      }

      get isPreferenceDefined(): boolean {
            return !!this.dialog.preference;
      }

      openSettingsDialog(): void {
            const dialogRef = this.matDialog.open(ChatSettingsDialogComponent, {
                  data: {preference: this.dialog.preference}
            });

            dialogRef.afterClosed().subscribe((result: Preference | undefined) => {
                  if (result) {
                        this.preferenceService.updatePreference(this.dialog.conversation.chat.identifier, result)
                  }
            });
      }
}
