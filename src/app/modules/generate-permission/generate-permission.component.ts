import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../services/title/title.service';

@Component({
  selector: 'app-generate-permission',
  standalone: true,
  imports: [],
  templateUrl: './generate-permission.component.html',
  styleUrl: './generate-permission.component.css'
})
export class GeneratePermissionComponent implements OnInit {
  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Permisos');
  }
}
