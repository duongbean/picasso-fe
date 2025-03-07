import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAlbumDetailComponent } from './view-album-detail.component';

describe('ViewAlbumDetailComponent', () => {
  let component: ViewAlbumDetailComponent;
  let fixture: ComponentFixture<ViewAlbumDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAlbumDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAlbumDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
