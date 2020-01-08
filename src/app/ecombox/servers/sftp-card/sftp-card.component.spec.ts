import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SftpCardComponent } from './sftp-card.component';

describe('SftpCardComponent', () => {
  let component: SftpCardComponent;
  let fixture: ComponentFixture<SftpCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SftpCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SftpCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
