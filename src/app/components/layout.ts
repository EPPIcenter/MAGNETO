import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mgn-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-sidenav-container fxFlex="grow">

      <ng-content></ng-content>

    </md-sidenav-container>
  `,
  styles: [`
    md-sidenav-container {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.03);
      width: 100%;
      height: 100%;
    }
    *, /deep/ * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `]
})
export class LayoutComponent { }
