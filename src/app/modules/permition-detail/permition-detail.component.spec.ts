import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermitionDetailComponent } from './permition-detail.component';

describe('PermitionDetailComponent', () => {
  let component: PermitionDetailComponent;
  let fixture: ComponentFixture<PermitionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermitionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermitionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
