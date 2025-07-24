import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { teamLeaderGuard } from './team-leader.guard';

describe('teamLeaderGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => teamLeaderGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
