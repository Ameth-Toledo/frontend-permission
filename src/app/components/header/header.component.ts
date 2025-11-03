import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../services/title/title.service';
import { CommonModule } from '@angular/common';
import { ModalNotifyComponent } from '../modal-notify/modal-notify.component';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ModalNotifyComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  nameInterface: string = '';
  showSearch: boolean = false;
  showNotification: boolean = false;

  constructor(private titleService: TitleService) {}

  ngOnInit() {
    this.titleService.title$.subscribe(title => this.nameInterface = title);
    this.titleService.search$.subscribe(show => this.showSearch = show);
  }

  toggleNotification() {
    this.showNotification = !this.showNotification;
  }

  closeNotification() {
    this.showNotification = false;
  }
}
