import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KanboardComponent } from './kanboard.component';

describe('KanboardComponent', () => {
  let component: KanboardComponent;
  let fixture: ComponentFixture<KanboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
