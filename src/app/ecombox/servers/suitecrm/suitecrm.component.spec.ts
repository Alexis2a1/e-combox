import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuitecrmComponent } from './suitecrm.component';

describe('SuitecrmComponent', () => {
  let component: SuitecrmComponent;
  let fixture: ComponentFixture<SuitecrmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuitecrmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuitecrmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
