import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalerSidebarComponent } from './saler-sidebar.component';

describe('SalerSidebarComponent', () => {
  let component: SalerSidebarComponent;
  let fixture: ComponentFixture<SalerSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalerSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
