import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-code-verification-dialog',
  templateUrl: './code-verification-dialog.component.html',
  styleUrls: ['./code-verification-dialog.component.scss']
})
export class CodeVerificationDialogComponent {
  enteredCode: string = '';
  isInvalid = false;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<CodeVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { netId: string },
    private apiService: ApiService
  ) {}

verifyCode(): void {
  if (!this.enteredCode || !this.enteredCode.startsWith('NZ')) {
    console.log('Code does not start with NZ');
    this.isInvalid = true;
    return;
  }

  this.isLoading = true;
  console.log('Verifying code:', this.enteredCode);

  this.apiService.verifyTechnicianNetID(this.enteredCode).subscribe({
    next: (isValid) => {
      console.log('Verification result:', isValid);
      this.isLoading = false;
      this.isInvalid = !isValid;
      if (isValid) {
        this.dialogRef.close(true);
      }
    },
    error: (error) => {
      console.error('Verification error:', error);
      this.isLoading = false;
      this.isInvalid = true;
    }
  });
}


  cancel(): void {
    this.dialogRef.close(false);
  }
}
