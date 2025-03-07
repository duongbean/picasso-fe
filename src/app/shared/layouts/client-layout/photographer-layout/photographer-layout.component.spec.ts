import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerLayoutComponent } from './photographer-layout.component';

describe('PhotographerLayoutComponent', () => {
  let component: PhotographerLayoutComponent;
  let fixture: ComponentFixture<PhotographerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
