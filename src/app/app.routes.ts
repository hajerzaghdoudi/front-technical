import { Routes } from '@angular/router';
import { TaskListComponent } from './pages/tasks/task-list/task-list.component';
import { TaskFormComponent } from './pages/tasks/task-form/task-form.component';
import { LoginComponent } from './pages/auth/login/login.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: "tasks", component: TaskListComponent },
    { path: "tasks/new", component: TaskFormComponent }

];
