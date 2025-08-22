import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {  firstValueFrom} from 'rxjs';
import { UIService } from 'src/app/_utility-services/ui.service';
import { ApiService } from 'src/app/api.service';
import { LeaderProfile } from 'src/app/interfaces';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnChanges {
  InputedStationID = "";
  InputedName = "";
  leader: LeaderProfile;  
  membersPerStationChart: any;
  membersPerLevelChart: any;
  successRateChart: any;

  constructor(
    private uiService: UIService,
    private apiService: ApiService
  ) {
    Chart.register(...registerables);

   this.leader = {
  Name: '',
  Project: '',
  NetID: '',
  Zone:'',
  Matricule:0,
  description: '',
  Supervisor:'',
  TeamMembers: []
};
  }

  ngOnInit() {
    this.uiService.setCurrentPageName('Home Page');
    this.loadAllLevelsByOperator();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.InputedStationID, this.InputedName);
  }

  async loadAllLevelsByOperator() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user || !user.NetID) {
      console.error('Utilisateur non connecté ou NetID manquant');
      return;
    }

    this.leader.NetID = user.NetID;
    this.leader.Name = user.Name || 'Team Leader';
    this.leader.Zone = user.Zone;
    this.leader.Project = user.Project || '';
    this.leader.Supervisor = user.Supervisor;
    this.leader.description = 'Description AND Notes';

    const teamMembers = await firstValueFrom(this.apiService.GET_Operators_By_TLNZ(this.leader.NetID));

    this.leader.TeamMembers = teamMembers.map((item: any) => ({
      id: item.id,
      currentLevel: item.currentLevel,
      Matricule: item.matricule,
      Name: item.name,
      StationName: item.currentStation,
      Project: item.project,
      completedLevels: [],
      TeamLeader: item.teamLeader
    }));

    for (const member of this.leader.TeamMembers) {
      const res = await firstValueFrom(this.apiService.GET_Levels_By_Operator(member.Matricule));
      member.completedLevels = res.map((item: any) => ({
        ID: item.lvlid,
        title: item.title,
        description: item.description,
        score: item.score,
        questionCount: item.questionCount,
        answers: []
      }));
    }

    this.initCharts();

  } catch (error) {
    console.error('Erreur lors du chargement des opérateurs:', error);
  }
}


  initCharts() {
    if (this.membersPerStationChart) this.membersPerStationChart.destroy();
    if (this.membersPerLevelChart) this.membersPerLevelChart.destroy();
    if (this.successRateChart) this.successRateChart.destroy();

    const stations = [...new Set(this.leader.TeamMembers.map(m => m.StationName))];
    const membersPerStation = stations.map(station => 
      this.leader.TeamMembers.filter(m => m.StationName === station).length
    );

    const maxLevel = Math.max(...this.leader.TeamMembers.map(m => m.currentLevel), 0);
    const levels = Array.from({length: maxLevel}, (_, i) => i + 1);
    const membersPerLevel = levels.map(lvl => 
      this.leader.TeamMembers.filter(m => m.currentLevel === lvl).length
    );

    this.createMembersPerStationChart(stations, membersPerStation);
    this.createMembersPerLevelChart(levels, membersPerLevel);
  }

  createMembersPerStationChart(stations: string[], counts: number[]) {
    const ctx = document.getElementById('membersPerStationChart') as HTMLCanvasElement;
    this.membersPerStationChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stations,
        datasets: [{
          label: 'Members per Station',
          data: counts,
          backgroundColor: 'green'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Team Members Distribution by Station'
          }
        }
      }
    });
  }

  createMembersPerLevelChart(levels: number[], counts: number[]) {
    const ctx = document.getElementById('membersPerLevelChart') as HTMLCanvasElement;
    this.membersPerLevelChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: levels.map(l => `Level ${l}`),
        datasets: [{
          label: 'Members by Level',
          data: counts,
          backgroundColor: ['#d41c23', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Team Members by Training Level'
          },
          legend: {
            position: 'right'
          },
          datalabels: {
            formatter: (value, context) => {
              const meta = context.chart.getDatasetMeta(0);
              const arc: any = meta.data[context.dataIndex]; 
            
              if (arc && arc.circumference !== undefined) {
                const percentage = arc.circumference / (2 * Math.PI) * 100;
                return `${value} Member(s)`;
              }
            
              return `${value}`;
            },
            color: '#fff',
            font: {
              weight: 'bold',
              size: 12
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

}