import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftMessageComponent } from './left-message.component';

describe('LeftMessageComponent', () => {
  let component: LeftMessageComponent;
  let fixture: ComponentFixture<LeftMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
