import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInfoBarComponent } from './chat-info-bar.component';

describe('ChatInfoBarComponent', () => {
  let component: ChatInfoBarComponent;
  let fixture: ComponentFixture<ChatInfoBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInfoBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatInfoBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
