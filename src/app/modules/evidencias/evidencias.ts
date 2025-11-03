import { Component } from '@angular/core';
import { TitleService } from '../../services/title/title.service';

@Component({
  selector: 'app-evidencias',
  imports: [],
  standalone: true,
  templateUrl: './evidencias.html',
  styleUrl: './evidencias.css',
})
export class Evidencias {
  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Evidencias');
  }
}
