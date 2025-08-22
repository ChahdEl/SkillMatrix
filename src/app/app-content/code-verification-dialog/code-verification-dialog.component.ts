import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-code-verification-dialog',
  templateUrl: './code-verification-dialog.component.html',
  styleUrls: ['./code-verification-dialog.component.scss']
})
export class CodeVerificationDialogComponent {
  enteredNz: string = '';
  enteredPwd: string = '';
  supervisor: boolean = false;

  isInvalid = false;
  isLoading = false;
  errorMsg: string | null = null;

 constructor(
  public dialogRef: MatDialogRef<CodeVerificationDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: {level: number },
  private apiService: ApiService
) {}

canSubmit(): boolean {
  const hasCreds = this.enteredNz?.trim().length > 0 && this.enteredPwd?.trim().length > 0;

  if (this.data.level === 4) {
    return hasCreds && this.supervisor;
  }
  return hasCreds;
}

verifyCode(): void {
  this.isInvalid = false;
  this.errorMsg = null;

  if (this.data.level === 4 && !this.supervisor) {
    this.isInvalid = true;
    this.errorMsg = 'Supervisor presence must be confirmed for Level 4.';
    return;
  }

  if (!this.enteredNz || !this.enteredNz.startsWith('NZ') || !this.enteredPwd) {
    this.isInvalid = true;
    this.errorMsg = 'Please enter valid NZ credentials.';
    return;
  }

  this.isLoading = true;

  this.apiService.verifyTechnicianNetID(this.enteredNz, this.enteredPwd).subscribe({
    next: (isValid) => {
      this.isLoading = false;
      this.isInvalid = !isValid;
      if (isValid) {
        this.dialogRef.close(true);
      } else {
        this.errorMsg = 'Invalid credentials.';
      }
    },
    error: (error) => {
      console.error('Verification error:', error);
      this.isLoading = false;
      this.isInvalid = true;
      this.errorMsg = 'An error occurred during verification.';
    }
  });
}

  cancel(): void {
    this.dialogRef.close(false);
  }
}
