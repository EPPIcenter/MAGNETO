import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mgn-sidenav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-sidenav opened={{open}} mode={{mode}} disableClose=false >
      <md-nav-list>
        <ng-content></ng-content>
      </md-nav-list>
    </md-sidenav>
  `,
  styles: [`
    md-sidenav {
      width: 350px;
    }
  `]
})
export class SidenavComponent {
  @Input() open = true;
  @Input() mode = 'side';
}
