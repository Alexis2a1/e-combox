import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PmaComponent } from './pma.component';

describe('PmaComponent', () => {
  let component: PmaComponent;
  let fixture: ComponentFixture<PmaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PmaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
