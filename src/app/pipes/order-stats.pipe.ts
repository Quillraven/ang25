import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';

@Pipe({
  name: 'orderStats',
  standalone: true
})
export class OrderStatsPipe implements PipeTransform {
  transform<K, V>(value: KeyValue<K, V>[]): KeyValue<K, V>[] {
    if (!value) return [];

    return value.sort((a, b) => {
      const keyA = String(a.key).toLowerCase();
      const keyB = String(b.key).toLowerCase();

      // Priority order: agility, life, damage
      if (keyA === 'agility' && keyB !== 'agility') return -1;
      if (keyB === 'agility' && keyA !== 'agility') return 1;

      if (keyA === 'life' && keyB !== 'life') return -1;
      if (keyB === 'life' && keyA !== 'life') return 1;

      if (keyA === 'damage' && keyB !== 'damage') return -1;
      if (keyB === 'damage' && keyA !== 'damage') return 1;

      // For all other keys, sort alphabetically
      return keyA.localeCompare(keyB);
    });
  }
}
