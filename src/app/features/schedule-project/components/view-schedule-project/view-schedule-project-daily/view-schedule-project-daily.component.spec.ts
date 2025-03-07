import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewScheduleProjectDailyComponent } from './view-schedule-project-daily.component';

describe('ViewScheduleProjectDailyComponent', () => {
  let component: ViewScheduleProjectDailyComponent;
  let fixture: ComponentFixture<ViewScheduleProjectDailyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewScheduleProjectDailyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewScheduleProjectDailyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
