import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpAvatarComponent } from './sign-up-avatar.component';

describe('SignUpAvatarComponent', () => {
  let component: SignUpAvatarComponent;
  let fixture: ComponentFixture<SignUpAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignUpAvatarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
