export interface LevelScore {
    ID: number;
    title: string;
    score: number;
    description: string;
    questionCount: number;
    answers:boolean[];
  }
  
  export interface UserProfile {
    id: number;
    Matricule: number;
    Name: string;
    TeamLeader: string;
    StationName: string;
    Project: string;
    currentLevel: number;
    completedLevels: LevelScore[];
  }

export interface Question {
    id: string;
    text: string;
    checked: boolean;
  } 
export interface Level {
    id: string;
    description: string;
    questions:Question[];
  }

  export interface LevelDetails {
    operatorID: number;
    lvlID: number;
    station: string;
    questionCount:number;
    questions:string[];
    answers:boolean[];
  } 
  export interface LeaderProfile {
    Name: string;
    Project: string;
    NetID: string;
    description: string;
    TeamMembers: UserProfile[];
  }