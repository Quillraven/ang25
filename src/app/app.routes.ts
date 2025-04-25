import { Routes } from '@angular/router';
import { EnemiesComponent } from './components/enemies/enemies.component';
import { HomeComponent } from './components/home/home.component';
import { HowToComponent } from './components/how-to/how-to.component';
import { ItemsComponent } from './components/items/items.component';
import { ActionsComponent } from './components/actions/actions.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'enemies', component: EnemiesComponent },
    { path: 'items', component: ItemsComponent },
    { path: 'actions', component: ActionsComponent },
    { path: 'how-to', component: HowToComponent },
];
