import {Component, OnInit} from '@angular/core';
import {switchMap} from 'rxjs';
import {DataParserService} from '../../services/data-parser.service';

export interface Enemy {
  imageUrl: string;
  name: string;
  level: number;
  life: number;
  agility: number;
  damage: number;
  talons: number;
  xp: number;
  actions: string[];
}

@Component({
  selector: 'app-enemies',
  templateUrl: './enemies.component.html',
  styleUrl: './enemies.component.css'
})
export class EnemiesComponent implements OnInit {
  enemies: Enemy[] = [];

  constructor(private dataParserService: DataParserService) {
  }

  ngOnInit(): void {
    this.dataParserService.fetchEnemyXml().pipe(
      switchMap(enemyXml => this.dataParserService.parseEnemyXml(enemyXml)),
      switchMap(parsedEnemies => {
        this.enemies = parsedEnemies;
        return this.dataParserService.fetchProperties();
      }),
      switchMap(propsStr => this.dataParserService.parseProperties(propsStr))
    ).subscribe({
      next: (propsData: { [key: string]: string }) => {
        this.updateEnemyNames(propsData);
        this.updateActionNames(propsData);
        this.sortEnemies();
      },

      error: (error) => {
        console.error('Error reading enemies', error);
      }
    });
  }

  updateEnemyNames(propsMap: { [key: string]: string }): void {
    this.enemies.forEach(enemy => {
      enemy.name = propsMap['enemy.' + enemy.name + ".name"] ?? "unnamed";
    });
  }

  updateActionNames(propsMap: { [key: string]: string }): void {
    this.enemies.forEach(enemy => {
      enemy.actions = enemy.actions.map(action => {
        if (action === 'ATTACK_SINGLE') {
          return "Attack (Single)"
        } else if (action === 'REGENERATE1') {
          action = "Regenerate";
        }

        return propsMap['magic.' + action.toLowerCase() + ".name"] ?? action;
      })
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
