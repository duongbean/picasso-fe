import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewScheduleProjectComponent } from './view-schedule-project.component';

describe('ViewScheduleProjectComponent', () => {
  let component: ViewScheduleProjectComponent;
  let fixture: ComponentFixture<ViewScheduleProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewScheduleProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewScheduleProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
