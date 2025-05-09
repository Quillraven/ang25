import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Observable} from 'rxjs';
import {Enemy} from '../components/enemies/enemies.component';
import {Item} from '../components/items/items.component';
import {Action} from '../components/actions/actions.component';
import {API_URL} from '../config/app.token';

@Injectable({
  providedIn: 'root'
})
export class DataParserService {
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    @Inject(API_URL) private readonly baseUrl: string
  ) {
  }

  fetchEnemiesJson(): Observable<string> {
    return this.http.get(this.baseUrl + "web/enemies.json", {responseType: 'text'});
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
            imageUrl: this.sanitizeImageUrl(this.baseUrl + enemyInfo.imageUrl),
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

  fetchActionsJson(): Observable<string> {
    return this.http.get(this.baseUrl + "web/actions.json", {responseType: 'text'});
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

  fetchItems(): Observable<string> {
    return this.http.get(this.baseUrl + "web/items.json", {responseType: 'text'});
  }

  parseItems(jsonData: string): Observable<Item[]> {
    return new Observable(subscriber => {
      try {
        const itemsData = JSON.parse(jsonData);

        if (!itemsData || !Array.isArray(itemsData)) {
          console.warn('No items found or invalid JSON structure');
          subscriber.next([]);
          subscriber.complete();
          return;
        }

        const items = new Array<Item>();
        itemsData.forEach((itemInfo: any) => {
          items.push({
            imageUrl: this.sanitizeImageUrl(this.baseUrl + itemInfo.imageUrl),
            name: itemInfo.name,
            category: itemInfo.category,
            stats: itemInfo.stats,
            speed: itemInfo.speed,
            action: itemInfo.action,
            cost: itemInfo.cost,
          });
        });

        subscriber.next(items);
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
