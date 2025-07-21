import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeVerificationDialogComponent } from './code-verification-dialog.component';

describe('CodeVerificationDialogComponent', () => {
  let component: CodeVerificationDialogComponent;
  let fixture: ComponentFixture<CodeVerificationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodeVerificationDialogComponent]
    });
    fixture = TestBed.createComponent(CodeVerificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
