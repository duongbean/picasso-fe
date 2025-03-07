import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalerCommonLayoutComponent } from './saler-common-layout.component';

describe('SalerCommonLayoutComponent', () => {
  let component: SalerCommonLayoutComponent;
  let fixture: ComponentFixture<SalerCommonLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalerCommonLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalerCommonLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
