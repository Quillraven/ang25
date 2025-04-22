import {Component, OnInit} from '@angular/core';
import {DataParserService} from '../../services/data-parser.service';
import {switchMap} from 'rxjs';

export interface Item {
  imageUrl: string;
  name: string;
  cost: number;
  category: string;
  constitution: number;
  damage: number;
  intelligence: number;
  lifeMax: number;
  life: number;
  manaMax: number;
  mana: number;
  physicalDamage: number;
  armor: number;
  strength: number;
  magicalEvade: number;
  resistance: number;
  speed: number;
  action: string;
}

@Component({
  selector: 'app-items',
  imports: [],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css'
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
    this.dataParserService.fetchObjectsXml().pipe(
      switchMap(objectsXml => this.dataParserService.parseItemXml(objectsXml)),
      switchMap(parsedItems => {
        this.items = parsedItems;
        return this.dataParserService.fetchProperties();
      }),
      switchMap(propsStr => this.dataParserService.parseProperties(propsStr))
    ).subscribe({
      next: (propsData: { [key: string]: string }) => {
        this.updateItemNames(propsData);
        this.updateActionNames();
        this.updateCategories();
        this.sortItems();
      },

      error: (error) => {
        console.error('Error reading items', error);
      }
    });
  }

  updateItemNames(propsMap: { [key: string]: string }): void {
    this.items.forEach(item => {
      if (item.name === 'terealis_plant') {
        item.name = propsMap['item.terealis_flower.name'] ?? "unnamed";
      } else {
        item.name = propsMap['item.' + item.name.toLowerCase() + ".name"] ?? "unnamed";
      }
    });
  }

  updateCategories(): void {
    this.items.forEach(item => {
      if (item.category === 'BOOTS') {
        item.category = 'Boots';
      } else if (item.category === 'ARMOR') {
        item.category = 'Armor';
      } else if (item.category === 'WEAPON') {
        item.category = 'Weapon';
      } else if (item.category === 'HELMET') {
        item.category = 'Helmet';
      } else if (item.category === 'ACCESSORY') {
        item.category = 'Accessory';
      } else if (item.category === 'QUEST') {
        item.category = 'Quest';
      } else {
        item.category = 'Other';
      }
    });
  }

  updateActionNames(): void {
    const actionsToIgnore = ['ITEM_HEALTH_RESTORE', 'ITEM_MANA_RESTORE'];

    this.items.forEach(item => {
      if (actionsToIgnore.includes(item.action)) {
        item.action = '';
      } else if (item.action === 'SCROLL_INFERNO') {
        item.action = 'Inferno';
      } else if (item.action === 'REGENERATE_MANA_RING') {
        item.action = 'Regenerate Mana';
      } else if (item.action === 'STR_BOOSTER') {
        item.action = 'Strength Booster';
      } else if (item.action === 'HEAL') {
        item.action = 'Heal';
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
