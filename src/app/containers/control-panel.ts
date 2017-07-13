import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../reducers';
import * as _ from 'lodash';

import { FileService } from '../services/files';
import { Node, NetworkTransition, NetworkTransitionSequence, NodeSet, NodeByIndexSet } from '../models/network';
import * as app from '../actions/app';

@Component({
  selector: 'mgn-control-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div fxLayout="column" fxLayoutGap="3%">
      <mgn-file-loader fxFlex="25%" class="control-unit"></mgn-file-loader>
      <mgn-transmission-summary-settings fxFlex="20%" class="control-unit"></mgn-transmission-summary-settings>
      <mgn-network-display-settings fxFlex="20%" class="control-unit"
        [displaySources]="renderSources$ | async"
        (toggleDisplaySources)="toggleDisplaySources($event)"
        [displayIsolatedNodes]="renderIsolatedNodes$ | async"
        (toggleDisplayIsolatedNodes)="toggleDisplayIsolatedNodes($event)">
      </mgn-network-display-settings>
    </div>
  `,
  styles: [`
    .control-unit {
    }
  `]
})
export class ControlPanelComponent {
  renderSources$: Observable<boolean>;
  renderIsolatedNodes$: Observable<boolean>;


  constructor(private store: Store<fromRoot.State>) {
    this.renderSources$ = this.store.select(fromRoot.getRenderSources);
    this.renderIsolatedNodes$ = this.store.select(fromRoot.getRenderIsolatedNodes);
  }

  toggleDisplaySources(b: boolean | null) {
    this.store.dispatch(new app.ToggleRenderSourceAction(b));
  };

  toggleDisplayIsolatedNodes(b: boolean | null) {
    this.store.dispatch(new app.ToggleRenderIsolatedNodes(b));
  }

}
