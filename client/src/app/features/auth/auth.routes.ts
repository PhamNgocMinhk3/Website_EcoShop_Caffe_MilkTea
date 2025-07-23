import { Routes } from '@angular/router';

import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { ForgotPasswordFormComponent } from './components/forgot-password-form/forgot-password-form.component';

// Export một hằng số chứa các route
export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: AuthPageComponent, // Sử dụng AuthPageComponent làm layout
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginFormComponent },
            { path: 'register', component: RegisterFormComponent },
            { path: 'forgot-password', component: ForgotPasswordFormComponent },
        ],
    },
];
