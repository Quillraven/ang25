import {Component, OnInit} from '@angular/core';
import {DataParserService} from '../../services/data-parser.service';
import {switchMap} from 'rxjs';

export type ActionType = 'Active (Offensive)' | 'Active (Defensive)' | 'Passive';

export interface Action {
  name: string;
  description: string;
  type: ActionType;
  targetType: string;
  manaCost: number;
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

  getTypes(): string[] {
    const types = [...new Set(this.actions.map(action => action.type))];

    const typeOrder: Array<ActionType> = ['Active (Offensive)', 'Active (Defensive)', 'Passive'];

    return types.sort((a, b) => {
      const indexA = typeOrder.indexOf(a);
      const indexB = typeOrder.indexOf(b);
      return indexA - indexB;
    });
  }

  getActionsByType(type: string): Action[] {
    return this.actions.filter(action => action.type === type);
  }

  ngOnInit(): void {
    this.dataParserService.fetchActionsJson().pipe(
      switchMap(actionsJson => this.dataParserService.parseActions(actionsJson))
    ).subscribe({
      next: (parsedActions) => {
        this.actions = parsedActions;
        this.sortActions();
      },
      error: (error) => {
        console.error('Error reading actions', error);
      }
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
