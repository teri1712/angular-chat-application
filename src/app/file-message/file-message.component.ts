import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FileEvent} from "../model/file-event";

@Component({
      selector: 'app-file-message',
      imports: [CommonModule, MatIconModule, MatButtonModule],
      templateUrl: './file-message.component.html',
      styleUrl: './file-message.component.css'
})
export class FileMessageComponent {
      @Input({required: true}) fileEvent!: FileEvent;

      readableSize(size: number | undefined): string {
            if (!size && size !== 0) return '';
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            let idx = 0;
            let s = size;
            while (s >= 1024 && idx < units.length - 1) {
                  s = s / 1024;
                  idx++;
            }
            return `${s.toFixed(s < 10 && idx > 0 ? 1 : 0)} ${units[idx]}`;
      }
}
