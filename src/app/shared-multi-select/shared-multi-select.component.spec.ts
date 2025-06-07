import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedMultiSelectComponent } from './shared-multi-select.component';

describe('SharedMultiSelectComponent', () => {
  let component: SharedMultiSelectComponent;
  let fixture: ComponentFixture<SharedMultiSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedMultiSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedMultiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
