import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {from, map, Observable} from 'rxjs';
import xml2js from 'xml2js';
import {Enemy} from '../components/enemies/enemies.component';
import {Item} from '../components/items/items.component';

@Injectable({
  providedIn: 'root'
})
export class DataParserService {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  fetchObjectsXml(): Observable<string> {
    return this.http.get("https://raw.githubusercontent.com/Quillraven/Masamune/refs/heads/master/assets/maps/objects.tsx", { responseType: 'text' });
  }

  parseEnemyXml(xmlData: string): Observable<Enemy[]> {
    const parser = new xml2js.Parser();

    return from(parser.parseStringPromise(xmlData)).pipe(
      map((result: any) => {
        const enemies: Enemy[] = [];
        if (!result.tileset || !Array.isArray(result.tileset.tile)) {
          console.warn('Invalid XML structure.');
          return enemies;
        }

        const enemyTiles = result.tileset.tile.filter((tile: any) => tile.$.type === 'EnemyObject');
        if (!enemyTiles || enemyTiles.length === 0) {
          console.warn('No enemies found');
          return enemies;
        }

        enemyTiles.forEach((enemyTile: any) => {
          const imageSource = enemyTile.image[0].$.source;
          const name = imageSource.split('/')[1].split('.')[0];
          const imageUrl = 'https://raw.githubusercontent.com/Quillraven/Masamune/refs/heads/master/assets/maps/' + imageSource;

          const enemyProps = enemyTile.properties[0];
          const level = enemyProps.property.find((prop: any) => prop.$.name === 'level')?.$?.value ?? 0;
          const talons = enemyProps.property.find((prop: any) => prop.$.name === 'talons')?.$?.value ?? 0;
          const xp = enemyProps.property.find((prop: any) => prop.$.name === 'xp')?.$?.value ?? 0;

          const stats = enemyProps.property
            .find((prop: any) => prop.$.name === 'stats')
            ?.properties[0]
            ?.property
            ?? [];
          const life = parseInt(stats.find((stat: any) => stat.$.name === 'baseLife')?.$?.value ?? 0);
          const agility = parseInt(stats.find((stat: any) => stat.$.name === 'agility')?.$?.value ?? 0);
          const damage = parseInt(stats.find((stat: any) => stat.$.name === 'damage')?.$?.value ?? 0);
          const mana = parseInt(stats.find((stat: any) => stat.$.name === 'baseMana')?.$?.value ?? 0);
          const resistance = parseInt(stats.find((stat: any) => stat.$.name === 'resistance')?.$?.value ?? 0);
          const armor = parseInt(stats.find((stat: any) => stat.$.name === 'armor')?.$?.value ?? 0);
          const physicalEvade = parseFloat(stats.find((stat: any) => stat.$.name === 'physicalEvade')?.$?.value ?? 0);

          const actions = enemyProps.property.find((prop: any) => prop.$.name === 'combatActions')?.$?.value ?? '';

          enemies.push({
            imageUrl: this.sanitizeImageUrl(imageUrl),
            name: name,
            level: level,
            damage: damage,
            mana: mana,
            resistance: resistance,
            armor: armor,
            physicalEvade: physicalEvade,
            life: life,
            agility: agility,
            talons: talons,
            xp: xp,
            actions: actions.split(','),
          });
        });

        return enemies;
      })
    );
  }

  parseItemXml(xmlData: string): Observable<Item[]> {
    const parser = new xml2js.Parser();

    return from(parser.parseStringPromise(xmlData)).pipe(
      map((result: any) => {
        const items: Item[] = [];
        if (!result.tileset || !Array.isArray(result.tileset.tile)) {
          console.warn('Invalid XML structure.');
          return items;
        }

        const itemTiles = result.tileset.tile.filter((tile: any) => tile.$.type === 'ItemObject');
        if (!itemTiles || itemTiles.length === 0) {
          console.warn('No items found');
          return items;
        }

        itemTiles.forEach((itemTile: any) => {
          const imageSource = itemTile.image[0].$.source;
          const name = imageSource.split('/')[1].split('.')[0];
          const imageUrl = 'https://raw.githubusercontent.com/Quillraven/Masamune/refs/heads/master/assets/maps/' + imageSource;

          const itemProps = itemTile.properties[0];
          const cost = itemProps.property.find((prop: any) => prop.$.name === 'cost')?.$?.value ?? 0;
          const category = itemProps.property.find((prop: any) => prop.$.name === 'category')?.$?.value ?? '';
          const speed = itemProps.property.find((prop: any) => prop.$.name === 'speed')?.$?.value ?? 0;
          const action = itemProps.property.find((prop: any) => prop.$.name === 'action')?.$?.value ?? '';

          const stats = itemProps.property
              .find((prop: any) => prop.$.name === 'stats')
              ?.properties[0]
              ?.property
            ?? [];
          const constitution = parseInt(stats.find((stat: any) => stat.$.name === 'constitution')?.$?.value ?? 0);
          const damage = parseInt(stats.find((stat: any) => stat.$.name === 'damage')?.$?.value ?? 0);
          const intelligence = parseInt(stats.find((stat: any) => stat.$.name === 'intelligence')?.$?.value ?? 0);
          const lifeMax = parseInt(stats.find((stat: any) => stat.$.name === 'lifeMax')?.$?.value ?? 0);
          const life = parseInt(stats.find((stat: any) => stat.$.name === 'life')?.$?.value ?? 0);
          const manaMax = parseInt(stats.find((stat: any) => stat.$.name === 'manaMax')?.$?.value ?? 0);
          const mana = parseInt(stats.find((stat: any) => stat.$.name === 'mana')?.$?.value ?? 0);
          const physicalDamage = parseFloat(stats.find((stat: any) => stat.$.name === 'physicalDamage')?.$?.value ?? 0);
          const armor = parseInt(stats.find((stat: any) => stat.$.name === 'armor')?.$?.value ?? 0);
          const strength = parseInt(stats.find((stat: any) => stat.$.name === 'strength')?.$?.value ?? 0);
          const magicalEvade = parseFloat(stats.find((stat: any) => stat.$.name === 'magicalEvade')?.$?.value ?? 0);
          const resistance = parseInt(stats.find((stat: any) => stat.$.name === 'resistance')?.$?.value ?? 0);

          items.push({
            imageUrl: this.sanitizeImageUrl(imageUrl),
            name: name,
            cost: cost,
            category: category,
            constitution: constitution,
            damage: damage,
            intelligence: intelligence,
            lifeMax: lifeMax,
            life: life,
            manaMax: manaMax,
            mana: mana,
            physicalDamage: physicalDamage,
            armor: armor,
            strength: strength,
            magicalEvade: magicalEvade,
            resistance: resistance,
            speed: speed,
            action: action,
          });
        });

        return items;
      })
    );
  }

  fetchProperties(): Observable<string> {
    return this.http.get("https://raw.githubusercontent.com/Quillraven/Masamune/refs/heads/master/assets/ui/messages.properties", { responseType: 'text' });
  }

  parseProperties(propsData: string): Observable<{ [key: string]: string }> {
    return new Observable(subscriber => {
      try {
        const lines = propsData.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
        const propertiesObject: { [key: string]: string } = lines.reduce((acc: { [key: string]: string }, line) => {
          const [key, value] = line.split('=').map(part => part.trim());
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {});
        subscriber.next(propertiesObject);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  sanitizeImageUrl(url: string): string {
    return this.sanitizer.bypassSecurityTrustUrl(url) as string;
  }

}
