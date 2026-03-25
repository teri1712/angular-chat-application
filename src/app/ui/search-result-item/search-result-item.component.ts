import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MessageHistory} from '../../model/dto/message-history';
import {Router} from "@angular/router";

@Component({
      selector: 'app-search-result-item',
      standalone: true,
      imports: [CommonModule, MatListModule, MatIconModule],
      templateUrl: './search-result-item.component.html',
      styleUrl: './search-result-item.component.css'
})
export class SearchResultItemComponent {
      @Input({required: true}) result!: MessageHistory;
      @Output() selected = new EventEmitter<void>();

      constructor(private router: Router) {
      }

      @HostListener('click', ['$event'])
      onClick(event: MouseEvent) {
            event.stopPropagation();
            this.router.navigate(['/home', {
                          outlets: {
                                'conversation': [this.result.chatId]
                          }
                    }],
                    {
                          queryParamsHandling: 'merge',
                          queryParams: {
                                sequenceNumber: this.result.sequenceNumber,
                          }
                    })
            this.selected.emit();
      }
}
