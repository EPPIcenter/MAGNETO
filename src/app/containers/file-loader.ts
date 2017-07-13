import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../reducers';
import * as _ from 'lodash';

import { FileService } from '../services/files';
import { Node, NetworkTransition, NetworkTransitionSequence, NodeSet, NodeByIndexSet } from '../models/network';
import * as app from '../actions/app';

@Component({
  selector: 'mgn-file-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-card>
      <md-card-title>
        Load Files
      </md-card-title>
      <md-card-actions>
        <mgn-control-button
          title="LOAD NODES"
          busyTitle="Loading Nodes..."
          [busy]="nodesLoading$ | async"
          (clicked) = "loadNodes()">
        </mgn-control-button>

        <mgn-control-button
          title="LOAD SOURCES"
          busyTitle="Loading Sources..."
          [busy]="sourcesLoading$ | async"
          (clicked) = "loadSources()">
        </mgn-control-button>

        <mgn-control-button
          title="LOAD NETWORKS"
          busyTitle="Loading Networks..."
          [busy]="networksLoading$ | async"
          [disabledConditions]="[!(sourcesLoaded$ | async), !(nodesLoaded$ | async)]"
          (clicked) = "loadNetworks()">
        </mgn-control-button>

      </md-card-actions>
    </md-card>
  `,
  styles: [`
    md-card {

    }
  `]
})
export class FileLoaderComponent {
  sourcesLoading$: Observable<boolean>;
  nodesLoading$: Observable<boolean>;
  networksLoading$: Observable<boolean>;
  sourcesLoaded$: Observable<boolean>;
  nodesLoaded$: Observable<boolean>;
  networksLoaded$: Observable<boolean>;

  constructor(private store: Store<fromRoot.State>) {
    this.sourcesLoading$ = this.store.select(fromRoot.getLoadingSources);
    this.nodesLoading$ = this.store.select(fromRoot.getLoadingNodes);
    this.networksLoading$ = this.store.select(fromRoot.getLoadingNetworks);
    this.sourcesLoaded$ = this.store.select(fromRoot.getSourcesLoaded);
    this.nodesLoaded$ = this.store.select(fromRoot.getNodesLoaded);
    this.networksLoaded$ = this.store.select(fromRoot.getNetworksLoaded);
  }

  loadNetworks() {
    this.store.dispatch(new app.LoadNetworksFileAction());
  };

  loadNodes() {
    this.store.dispatch(new app.LoadNodesFileAction());
  }

  loadSources() {
    this.store.dispatch(new app.LoadSourcesFileAction());
  }
}
