import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WoocommerceComponent } from './woocommerce.component';

describe('WoocommerceComponent', () => {
  let component: WoocommerceComponent;
  let fixture: ComponentFixture<WoocommerceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoocommerceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoocommerceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
