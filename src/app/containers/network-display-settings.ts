import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { MdSlideToggleChange } from '@angular/material';

import * as fromRoot from '../reducers';
import * as _ from 'lodash';

import { FileService } from '../services/files';
import { Node, NetworkTransition, NetworkTransitionSequence, NodeSet, NodeByIndexSet } from '../models/network';
import * as app from '../actions/app';

@Component({
  selector: 'mgn-network-display-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-card>
      <md-card-title>
        Display Settings
      </md-card-title>
      <md-card-content>
        <md-slide-toggle
            [color]="color"
            [checked]="displaySources"
            (change)="changeDisplaySources($event)">
          Display Sources
        </md-slide-toggle>
        <md-slide-toggle
            [color]="color"
            [checked]="displayIsolatedNodes"
            (change)="changeDisplayIsolatedNodes($event)">
          Display Isolated Nodes
        </md-slide-toggle>
      </md-card-content>
    </md-card>
  `
})
export class NetworkDisplaySettingsComponent {
  @Input() color = 'accent';
  @Input() displaySources;
  @Input() displayIsolatedNodes;
  @Output() toggleDisplaySources = new EventEmitter();
  @Output() toggleDisplayIsolatedNodes = new EventEmitter();

  changeDisplaySources(e: MdSlideToggleChange) {
    this.toggleDisplaySources.emit(e.checked);
  }

  changeDisplayIsolatedNodes(e: MdSlideToggleChange) {
    this.toggleDisplayIsolatedNodes.emit(e.checked);
  }
}
