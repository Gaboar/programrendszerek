import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { adminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'signup', loadComponent: () => import('./signup/signup.component').then((c) => c.SignupComponent) },
    { path: 'login', loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent) },
    { path: 'timeline', loadComponent: () => import('./timeline/timeline.component').then((c) => c.TimelineComponent), canActivate: [authGuard] },
    { path: 'profile/:userid', loadComponent: () => import('./profile/profile.component').then((c) => c.ProfileComponent), canActivate: [authGuard] },
    { path: 'group/:groupid', loadComponent: () => import('./group/group.component').then((c) => c.GroupComponent), canActivate: [authGuard] },
    { path: 'edit-profile', loadComponent: () => import('./profile-editor/profile-editor.component').then((c) => c.ProfileEditorComponent), canActivate: [authGuard] },
    { path: 'create-group', loadComponent: () => import('./group-creator/group-creator.component').then((c) => c.GroupCreatorComponent), canActivate: [authGuard] },
    { path: 'admin', loadComponent: () => import('./admin-panel/admin-panel.component').then((c) => c.AdminPanelComponent), canActivate: [adminGuard] },
    { path: '**', redirectTo: 'login' }
];
