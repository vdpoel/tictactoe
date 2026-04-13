import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./features/game/player-setup/player-setup.component').then(m => m.PlayerSetupComponent) },
];
