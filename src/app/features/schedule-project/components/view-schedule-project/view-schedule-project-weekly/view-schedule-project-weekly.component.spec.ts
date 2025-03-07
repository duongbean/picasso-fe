import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewScheduleProjectWeeklyComponent } from './view-schedule-project-weekly.component';

describe('ViewScheduleProjectWeeklyComponent', () => {
  let component: ViewScheduleProjectWeeklyComponent;
  let fixture: ComponentFixture<ViewScheduleProjectWeeklyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewScheduleProjectWeeklyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewScheduleProjectWeeklyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
