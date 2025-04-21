import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {from, map, Observable} from 'rxjs';
import xml2js from 'xml2js';
import {Enemy} from '../components/enemies/enemies.component';

@Injectable({
  providedIn: 'root'
})
export class DataParserService {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  fetchEnemyXml(): Observable<string> {
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

          let enemyProps = enemyTile.properties[0];
          const level = enemyProps.property.find((prop: any) => prop.$.name === 'level')?.$?.value ?? 0;
          const talons = enemyProps.property.find((prop: any) => prop.$.name === 'talons')?.$?.value ?? 0;
          const xp = enemyProps.property.find((prop: any) => prop.$.name === 'xp')?.$?.value ?? 0;

          const stats = enemyProps.property
            .find((prop: any) => prop.$.name === 'stats')
            ?.properties[0]
            ?.property
            ?? {};
          const life = parseInt(stats.find((stat: any) => stat.$.name === 'baseLife')?.$?.value ?? 0);
          const agility = parseInt(stats.find((stat: any) => stat.$.name === 'agility')?.$?.value ?? 0);
          const damage = parseInt(stats.find((stat: any) => stat.$.name === 'damage')?.$?.value ?? 0);

          const actions = enemyProps.property.find((prop: any) => prop.$.name === 'combatActions')?.$?.value ?? '';

          enemies.push({
            imageUrl: this.sanitizeImageUrl(imageUrl),
            name: name,
            level: level,
            damage: damage,
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
