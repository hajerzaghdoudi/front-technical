import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderDetailsDialogComponent } from './folder-details-dialog.component';

describe('FolderDetailsDialogComponent', () => {
  let component: FolderDetailsDialogComponent;
  let fixture: ComponentFixture<FolderDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FolderDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
