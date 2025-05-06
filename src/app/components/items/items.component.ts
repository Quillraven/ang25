import {Component, OnInit} from '@angular/core';
import {CommonModule, KeyValuePipe} from '@angular/common';
import {DataParserService} from '../../services/data-parser.service';
import {switchMap} from 'rxjs';
import {FormatStatsKeyPipe} from '../../pipes/format-key.pipe';
import {OrderStatsPipe} from '../../pipes/order-stats.pipe';

export interface Item {
  imageUrl: string;
  name: string;
  category: string;
  stats: { [key: string]: number };
  speed: number;
  action: string;
  cost: number;
}

@Component({
  selector: 'app-items',
  imports: [CommonModule, FormatStatsKeyPipe, OrderStatsPipe],
  providers: [KeyValuePipe],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css',
  standalone: true
})
export class ItemsComponent implements OnInit {
  items: Item[] = [];

  constructor(private dataParserService: DataParserService) {
  }

  getCategories(): string[] {
    const categories = [...new Set(this.items.map(item => item.category))];

    // Define the order of categories
    const categoryOrder = ['Weapon', 'Armor', 'Helmet', 'Boots', 'Accessory', 'Other', 'Quest'];

    // Sort categories based on the defined order
    return categories.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      return indexA - indexB;
    });
  }

  getItemsByCategory(category: string): Item[] {
    return this.items.filter(item => item.category === category);
  }

  ngOnInit(): void {
    this.dataParserService.fetchItems().pipe(
      switchMap(itemsJson => this.dataParserService.parseItems(itemsJson)),
    ).subscribe({
      next: (parsedItems) => {
        this.items = parsedItems;
        this.sortItems();
      },

      error: (error) => {
        console.error('Error reading items', error);
      }
    });
  }

  sortItems(): void {
    this.items = this.items.sort((a, b) => {
      if (a.category < b.category) {
        return -1;
      }
      if (a.category > b.category) {
        return 1;
      }

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
