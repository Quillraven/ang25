import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements AfterViewInit {

  @ViewChild('navMenu') navMenuElement!: ElementRef<HTMLDetailsElement>;

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    if (!this.navMenuElement) {
      console.error("Couldn't find the 'navMenu' element.");
    }
  }

  closeMenu(): void {
    if (!this.navMenuElement || !this.navMenuElement.nativeElement) {
      console.warn("Cannot close menu because of missing 'navMenuElement'");
      return;
    }

    this.renderer.removeAttribute(this.navMenuElement.nativeElement, 'open');
  }

}
