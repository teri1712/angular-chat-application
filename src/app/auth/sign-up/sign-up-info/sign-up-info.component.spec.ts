import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpInfoComponent } from './sign-up-info.component';

describe('SignUpInfoComponent', () => {
  let component: SignUpInfoComponent;
  let fixture: ComponentFixture<SignUpInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignUpInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
