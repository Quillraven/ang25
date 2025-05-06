import {Component, OnInit} from '@angular/core';
import {CommonModule, KeyValuePipe} from '@angular/common';
import {switchMap} from 'rxjs';
import {DataParserService} from '../../services/data-parser.service';
import {FormatStatsKeyPipe} from '../../pipes/format-key.pipe';
import {OrderStatsPipe} from '../../pipes/order-stats.pipe';

export interface Enemy {
  imageUrl: string;
  name: string;
  level: number;
  stats: { [key: string]: number };
  talons: number;
  xp: number;
  combatActions: string[];
}

@Component({
  selector: 'app-enemies',
  templateUrl: './enemies.component.html',
  styleUrl: './enemies.component.css',
  providers: [KeyValuePipe],
  imports: [CommonModule, FormatStatsKeyPipe, OrderStatsPipe],
  standalone: true
})
export class EnemiesComponent implements OnInit {
  enemies: Enemy[] = [];

  constructor(private dataParserService: DataParserService) {
  }

  ngOnInit(): void {
    this.dataParserService.fetchEnemiesJson().pipe(
      switchMap(enemiesJson => this.dataParserService.parseEnemiesJson(enemiesJson)),
    ).subscribe({
      next: (parsedEnemies) => {
        this.enemies = parsedEnemies;
        this.sortEnemies();
      },

      error: (error) => {
        console.error('Error reading enemies', error);
      }
    });
  }

  sortEnemies(): void {
    this.enemies = this.enemies.sort((a, b) => {
      // First sort by level (ascending)
      if (a.level < b.level) {
        return -1;
      }
      if (a.level > b.level) {
        return 1;
      }
      // If levels are equal, then sort by name (alphabetical)
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0; // Names are also equal
    });
  }
}
