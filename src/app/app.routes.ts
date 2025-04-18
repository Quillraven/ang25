import { Routes } from '@angular/router';
import { EnemiesComponent } from './enemies/enemies.component';
import { GameComponent } from './game/game.component';
import { HomeComponent } from './home/home.component';
import { HowToComponent } from './how-to/how-to.component';
import { ItemsComponent } from './items/items.component';
import { SpellsComponent } from './spells/spells.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'game', component: GameComponent },
    { path: 'enemies', component: EnemiesComponent },
    { path: 'items', component: ItemsComponent },
    { path: 'spells', component: SpellsComponent },
    { path: 'how-to', component: HowToComponent },
];
