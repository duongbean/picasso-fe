import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProjectDetailComponent } from './view-project-detail.component';

describe('ViewProjectDetailComponent', () => {
  let component: ViewProjectDetailComponent;
  let fixture: ComponentFixture<ViewProjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProjectDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
