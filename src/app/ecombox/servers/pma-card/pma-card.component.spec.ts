import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PmaCardComponent } from './pma-card.component';

describe('PmaCardComponent', () => {
  let component: PmaCardComponent;
  let fixture: ComponentFixture<PmaCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PmaCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PmaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
