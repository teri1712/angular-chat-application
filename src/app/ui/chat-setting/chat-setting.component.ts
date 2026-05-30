import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ChatSettingsDialogComponent} from '../chat-settings-dialog/chat-settings-dialog.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {PreferenceService} from '../../service/preference.service';
import {Preference} from '../../model/dto/preference';

@Component({
      selector: 'app-chat-setting',
      templateUrl: './chat-setting.component.html',
      styleUrls: ['./chat-setting.component.css'],
      standalone: true,
      imports: [MatButtonModule, MatIconModule, MatDialogModule],
      changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatSettingComponent {
      chatId = input<string | null>(null);
      preference = input<Preference | null>(null);

      constructor(
              public matDialog: MatDialog,
              private preferenceService: PreferenceService
      ) {
      }

      openSettingsDialog(chatId: string, preference: Preference): void {
            const dialogRef = this.matDialog.open(ChatSettingsDialogComponent, {
                  data: {preference: preference},
                  maxWidth: '100vw',
                  panelClass: 'modern-dialog'
            });

            dialogRef.afterClosed().subscribe((result: Preference | undefined) => {
                  if (result) {
                        this.preferenceService.updatePreference(chatId, result)
                  }
            });
      }
}
