import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HumhubComponent } from './humhub.component';

describe('HumhubComponent', () => {
  let component: HumhubComponent;
  let fixture: ComponentFixture<HumhubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HumhubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HumhubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
