import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerViewProjectsComponent } from './customer-view-projects.component';

describe('CustomerViewProjectsComponent', () => {
  let component: CustomerViewProjectsComponent;
  let fixture: ComponentFixture<CustomerViewProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerViewProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerViewProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
