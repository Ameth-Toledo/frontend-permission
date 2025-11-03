import { Component } from '@angular/core';
import { TitleService } from '../../services/title/title.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  constructor(private titleService: TitleService, private router: Router) { }

  ngOnInit(){
    this.titleService.setTitle('Tutorados');
  }

  sentTopermisos(event: Event) {
    event.preventDefault();
    this.router.navigate(['dashboard/generate-permission']);
  }
}
