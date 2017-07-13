import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../reducers';
import * as _ from 'lodash';

import { FileService } from '../services/files';
import { Node, NetworkTransition, NetworkTransitionSequence, NodeSet, NodeByIndexSet, Edge } from '../models/network';
import * as app from '../actions/app';

@Component({
  selector: 'mgn-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mgn-layout fxLayout="column">
      <div fxLayout="column">
        <mgn-toolbar fxFlex="64px" title="MAGNETO">
        </mgn-toolbar>
        <div fxFlex="calc(100vh - 84px)" fxLayout="row" fxLayoutGap="10px" style="margin: 10px">
          <div fxFlex="250px">
            <mgn-control-panel></mgn-control-panel>
          </div>
          <div fxFlex="grow" fxLayout="column">
            <div fxFlex="99%" fxLayout="row">
              <mgn-network-panel fxFlex
                [nodes]="renderedNodes$ | async"
                [edges]="renderedEdges$ | async"
                [nodeSize]="nodeSize"
                [nodeColor]="nodeColor"
                [nodeEdgeWidth]="enlargeSelectedNode"
                [selectedNode]="selectedNode$ | async"
                (selectNode)="selectNode($event)" >
              </mgn-network-panel>
            </div>
          </div>
          <div fxFlex="400px" fxLayout="column">
            <mgn-selected-node-panel fxFlex="grow" fxLayout="column"
              [selectedNode] = "selectedNode$ | async"
              [parentNodes]="parentNodes$ | async"
            ></mgn-selected-node-panel>
          </div>
        </div>
      </div>
    </mgn-layout>
  `
})
export class AppComponent {
  renderedNodes$: Observable<Node[]>;
  networkSummary$: Observable<Edge[]>;
  renderedEdges$: Observable<Edge[]>;
  transitions$: Observable<NetworkTransitionSequence>;
  selectedNode$: Observable<Node>;
  parentNodes$: Observable<Node[]>;

  // nodeColor = 'blue';

  constructor(private store: Store<fromRoot.State>) {
    this.renderedNodes$ = this.store.select(fromRoot.getRenderedNodes);
    this.renderedEdges$ = this.store.select(fromRoot.getRenderedEdges);
    this.transitions$ = this.store.select(fromRoot.getNetworkTransitions);
    this.networkSummary$ = this.store.select(fromRoot.getNetworkSummary);
    this.selectedNode$ = this.store.select(fromRoot.getSelectedNode);
    this.parentNodes$ = this.store.select(fromRoot.getSelectedNodeParents);
  }

  selectNode(node: Node) {
    if (node) {
      this.store.dispatch(new app.SelectNodeAction(node.nodeIndex));
    } else {
      this.store.dispatch( new app.DeselectNodeAction());
    }
  };

  enlargeSelectedNode = function(node: Node) {
    if (this.selectedNode && (node.nodeIndex === this.selectedNode.nodeIndex)) {
      return 6;
    } else {
      return 1;
    }
  };

  nodeSize = function(node: Node) {
    if (node.isSource) {
      return 12;
    } else {
      return 5;
    }
  };

  nodeColor = function(node: Node) {
    if (node.isSource) {
      return 'red';
    } else {
      return 'green';
    }
  };



}
