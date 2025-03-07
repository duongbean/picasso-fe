import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAlbumsComponent } from './view-albums.component';

describe('ViewAlbumsComponent', () => {
  let component: ViewAlbumsComponent;
  let fixture: ComponentFixture<ViewAlbumsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAlbumsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAlbumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
