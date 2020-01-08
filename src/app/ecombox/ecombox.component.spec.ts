import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomboxComponent } from './ecombox.component';

describe('EcomboxComponent', () => {
  let component: EcomboxComponent;
  let fixture: ComponentFixture<EcomboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomboxComponent, ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
