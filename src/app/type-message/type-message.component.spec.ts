import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeMessageComponent } from './type-message.component';

describe('TypeMessageComponent', () => {
  let component: TypeMessageComponent;
  let fixture: ComponentFixture<TypeMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
