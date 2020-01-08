import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MauticComponent } from './mautic.component';

describe('MauticComponent', () => {
  let component: MauticComponent;
  let fixture: ComponentFixture<MauticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MauticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MauticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
