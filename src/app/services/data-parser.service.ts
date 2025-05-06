import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {from, map, Observable} from 'rxjs';
import xml2js from 'xml2js';
import {Enemy} from '../components/enemies/enemies.component';
import {Item} from '../components/items/items.component';
import {Action} from '../components/actions/actions.component';

@Injectable({
  providedIn: 'root'
})
export class DataParserService {
  private readonly baseImgUrl = 'https://raw.githubusercontent.com/Quillraven/Masamune/refs/heads/master/'

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
  }

  fetchEnemiesJson(): Observable<string> {
    return this.http.get("https://raw.githubusercontent.com/Quillraven/Masamune/refs/heads/master/web/enemies.json", {responseType: 'text'});
  }

  parseEnemiesJson(jsonData: string): Observable<Enemy[]> {
    return new Observable(subscriber => {
      try {
        const enemiesData = JSON.parse(jsonData);

        if (!enemiesData || !Array.isArray(enemiesData)) {
          console.warn('No enemies found or invalid JSON structure');
          subscriber.next([]);
          subscriber.complete();
          return;
        }

        const enemies = new Array<Enemy>();
        enemiesData.forEach((enemyInfo: any) => {
          enemies.push({
            imageUrl: this.sanitizeImageUrl(this.baseImgUrl + enemyInfo.imageUrl),
            name: enemyInfo.name,
            level: enemyInfo.level,
            stats: enemyInfo.stats,
            talons: enemyInfo.talons,
            xp: enemyInfo.xp,
            combatActions: enemyInfo.combatActions,
          });
        });

        subscriber.next(enemies);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
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
    return this.http.get("https://raw.githubusercontent.com/Quillraven/Masamune/refs/heads/master/assets/ui/messages.properties", {responseType: 'text'});
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

  fetchActionsJson(): Observable<string> {
    return this.http.get("https://raw.githubusercontent.com/Quillraven/Masamune/refs/heads/master/web/actions.json", {responseType: 'text'});
  }

  parseActions(jsonData: string): Observable<Action[]> {
    return new Observable(subscriber => {
      try {
        const actionsData = JSON.parse(jsonData);

        if (!actionsData || !Array.isArray(actionsData)) {
          console.warn('No actions found or invalid JSON structure');
          subscriber.next([]);
          subscriber.complete();
          return;
        }

        const actions = new Array<Action>();
        actionsData.forEach((actionInfo: any) => {
          actions.push({
            name: actionInfo.name,
            description: actionInfo.description,
            type: actionInfo.type,
            targetType: actionInfo.targetType,
            manaCost: actionInfo.manaCost,
          })
        });

        subscriber.next(actions);
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
