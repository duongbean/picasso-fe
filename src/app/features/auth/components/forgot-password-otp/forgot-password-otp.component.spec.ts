import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordOtpComponent } from './forgot-password-otp.component';

describe('ForgotPasswordOtpComponent', () => {
  let component: ForgotPasswordOtpComponent;
  let fixture: ComponentFixture<ForgotPasswordOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
