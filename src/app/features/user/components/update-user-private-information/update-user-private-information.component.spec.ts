import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserPrivateInformationComponent } from './update-user-private-information.component';

describe('UpdateUserPrivateInformationComponent', () => {
  let component: UpdateUserPrivateInformationComponent;
  let fixture: ComponentFixture<UpdateUserPrivateInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateUserPrivateInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateUserPrivateInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
