import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordNewPasswordComponent } from './forgot-password-new-password.component';

describe('ForgotPasswordNewPasswordComponent', () => {
  let component: ForgotPasswordNewPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordNewPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordNewPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordNewPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
