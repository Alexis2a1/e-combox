import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerModelComponent } from './server-model.component';

describe('ServerModelComponent', () => {
  let component: ServerModelComponent;
  let fixture: ComponentFixture<ServerModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
