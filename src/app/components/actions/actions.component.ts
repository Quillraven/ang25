import {Component, OnInit} from '@angular/core';
import {DataParserService} from '../../services/data-parser.service';
import {switchMap} from 'rxjs';

export type ActionCategory = 'Active (Offensive)' | 'Active (Defensive)' | 'Passive';

export interface Action {
  name: string;
  description: string;
  manaCost: number;
  category: ActionCategory;
}

@Component({
  selector: 'app-actions',
  imports: [],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.css'
})
export class ActionsComponent implements OnInit {
  actions: Action[] = [];

  constructor(private dataParserService: DataParserService) {
  }

  getCategories(): string[] {
    const categories = [...new Set(this.actions.map(action => action.category))];

    // Define the order of categories
    const categoryOrder: Array<ActionCategory> = ['Active (Offensive)', 'Active (Defensive)', 'Passive'];

    // Sort categories based on the defined order
    return categories.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      return indexA - indexB;
    });
  }

  getActionsByCategory(category: string): Action[] {
    return this.actions.filter(action => action.category === category);
  }

  ngOnInit(): void {
    this.dataParserService.fetchProjectJson().pipe(
      switchMap(projectJson => this.dataParserService.parseActions(projectJson)),
      switchMap(parsedActions => {
        const actionsToIgnore = ['UNDEFINED', 'USE_ITEM'];
        this.actions = parsedActions.filter(action => !actionsToIgnore.includes(action.name));
        return this.dataParserService.fetchProperties();
      }),
      switchMap(propsStr => this.dataParserService.parseProperties(propsStr))
    ).subscribe({
      next: (propsData: { [key: string]: string }) => {
        this.updateCategories();
        this.updateNameAndDescription(propsData);
        this.sortActions();
      },

      error: (error) => {
        console.error('Error reading actions', error);
      }
    });
  }

  updateCategories(): void {
    const categoryMap: Map<string, ActionCategory> = new Map();
    categoryMap.set('HEAL', 'Active (Defensive)');
    categoryMap.set('ITEM_HEALTH_RESTORE', 'Active (Defensive)');
    categoryMap.set('ITEM_MANA_RESTORE', 'Active (Defensive)');
    categoryMap.set('REGENERATE_MANA_RING', 'Passive');
    categoryMap.set('STR_BOOSTER', 'Passive');
    categoryMap.set('TRANSFORM', 'Passive');

    this.actions.forEach(action => {
      action.category = categoryMap.get(action.name) ?? 'Active (Offensive)';
    });
  }

  updateNameAndDescription(propsMap: { [key: string]: string }): void {
    this.actions.forEach(action => {
      action.name = propsMap['magic.' + action.name.toLowerCase() + ".name"] ?? action.name;
      action.description = propsMap['magic.' + action.name.toLowerCase() + ".description"] ?? '';
    });
  }

  sortActions(): void {
    this.actions = this.actions.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  }
}
