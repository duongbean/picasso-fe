import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPhotoProjectComponent } from './view-photo-project.component';

describe('ViewPhotoProjectComponent', () => {
  let component: ViewPhotoProjectComponent;
  let fixture: ComponentFixture<ViewPhotoProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPhotoProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPhotoProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
