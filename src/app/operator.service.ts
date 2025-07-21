import { Injectable } from '@angular/core';
import { UserProfile } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  operator: UserProfile | null = null;
  updateScore(levelId: number, newScore: number) {
    if (!this.operator) return;
    const level = this.operator.completedLevels.find(l => l.ID === levelId);
    if (level) level.score = newScore;
  }
  getOperator(): UserProfile | null {
    return this.operator;
  }
   setOperator(op: UserProfile) {
    this.operator = op;
  }
}
