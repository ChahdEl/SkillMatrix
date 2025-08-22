import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UIService } from 'src/app/_utility-services/ui.service';
import { ApiService } from 'src/app/api.service';
import { UserProfile } from 'src/app/interfaces';
import { Location } from '@angular/common';

interface StationLevel {
  Station: string;
  LevelID: number;
  Score: number;
}

@Component({
  selector: 'app-operator-stations',
  templateUrl: './operator-stations.component.html',
  styleUrls: ['./operator-stations.component.css']
})
export class OperatorStationsComponent implements OnInit {
  operatorMatricule: number;
  operator: UserProfile;
  stationLevels: StationLevel[] = [];
  filteredStationLevels: StationLevel[] = []; 

  stationFilter = '';
  levelFilter = '';
  scoreFilter = '';

  constructor(private route: ActivatedRoute, private uiService: UIService, private apiService: ApiService, private location: Location) {
    this.operatorMatricule = +this.route.snapshot.paramMap.get('matricule')!;
    this.operator = {
      Name: "test",
      Project: "",
      TeamLeader: "",
      StationName: "",
      id: 0,
      Matricule: 0,
      completedLevels: [],
      currentLevel: 0
    };
  }

  ngOnInit(): void {
    this.uiService.setCurrentPageName('Operator stations');
    this.loadAllLevelsByOperator();
    this.loadOperatorStations();
  }

  goBackToPrevPage(): void {
    this.location.back();
  }

  async loadOperatorStations() {
    try {
      const res = await firstValueFrom(this.apiService.GET_PastStations_By_Operator(this.operatorMatricule));
      this.stationLevels = res.map((item: any) => ({
        LevelID: item.lvlid,
        Station: item.station,
        Score: item.score
      }));
      this.filteredStationLevels = this.stationLevels; 
    } catch (error) {
      console.error('Error loading operator stations:', error);
    }
  }

  async loadAllLevelsByOperator() {
    try {
      const res = await firstValueFrom(this.apiService.GET_Operator_By_ID(this.operatorMatricule));
      const operatorData = Array.isArray(res) ? res[0] : res; 
      this.operator = {
        id: operatorData.id,
        Matricule: operatorData.matricule,
        TeamLeader: operatorData.teamLeader,
        Name: operatorData.name,
        StationName: operatorData.currentStation,
        Project: operatorData.project,
        completedLevels: [],
        currentLevel: operatorData.currentLevel,
      };

      const res2 = await firstValueFrom(this.apiService.GET_Levels_By_Operator(this.operatorMatricule));
      this.operator.completedLevels = res2.map((item: any) => {
        const answers: boolean[] = [];
        for (let i = 1; i <= 20; i++) {
          answers.push(!!item[`anS${i}`]);
        }
        return {
          ID: item.lvlid,
          title: item.title,
          description: item.description,
          score: item.score,
          questionCount: item.questionCount,
          answers: answers
        };
      });
    } catch (error) {
      console.error('Error loading operator data:', error);
    }
  }

  applyFilters() {
    this.filteredStationLevels = this.stationLevels.filter(station => {
      const matchesStation = station.Station.toLowerCase().includes(this.stationFilter.toLowerCase());
      const matchesLevel = this.levelFilter ? station.LevelID === +this.levelFilter : true;
      const matchesScore = this.scoreFilter ? station.Score >= +this.scoreFilter : true;
      return matchesStation && matchesLevel && matchesScore;
    });
  }
}
