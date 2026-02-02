import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MessageHistory} from '../../model/dto/message-history';

@Component({
      selector: 'app-search-result-item',
      standalone: true,
      imports: [CommonModule, MatListModule, MatIconModule],
      templateUrl: './search-result-item.component.html',
      styleUrl: './search-result-item.component.css'
})
export class SearchResultItemComponent {
      @Input({required: true}) result!: MessageHistory;
      @Output() resultClick = new EventEmitter<MessageHistory>();

      onItemClick() {
            // Placeholder for custom action
            console.log('Search result clicked:', this.result);
            this.resultClick.emit(this.result);
      }
}
