import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OdooComponent } from './odoo.component';

describe('OdooComponent', () => {
  let component: OdooComponent;
  let fixture: ComponentFixture<OdooComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OdooComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OdooComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
