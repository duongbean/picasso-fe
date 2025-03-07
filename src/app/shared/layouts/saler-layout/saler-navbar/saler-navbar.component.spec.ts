import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalerNavbarComponent } from './saler-navbar.component';

describe('SalerNavbarComponent', () => {
  let component: SalerNavbarComponent;
  let fixture: ComponentFixture<SalerNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalerNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalerNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
