import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'ic-root',
    standalone: true,
	imports: [RouterModule],
	template: `<router-outlet></router-outlet>`,
	styleUrl: './app.component.scss',
})
export class AppComponent {}
