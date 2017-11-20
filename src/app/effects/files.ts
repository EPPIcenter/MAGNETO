import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/mergeMap';

import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';

import { FileService } from '../services/files';
import * as app from '../actions/app';

import { NetworkTransition, NodeByIndexSet } from '../models/network';

@Injectable()
export class FileEffects {

  @Effect()
  loadNetworks$: Observable<Action> = this.actions$
    .ofType(app.LOAD_NETWORKS_FILE)
    .switchMap(() => {
      return this.store.select(fromRoot.getNodes).take(1);
    })
    .switchMap(nodes => {
      return this.fileService.loadNetworkFile(nodes)
        .map(networkTransitions => {
          return new app.LoadNetworksSuccessAction(networkTransitions);
        })
        .catch((err: Error) => {
          return of(new app.LoadNetworksFailureAction(err.message));
        });
    });

  @Effect()
  loadNodes$: Observable<Action> = this.actions$
    .ofType(app.LOAD_NODES_FILE)
    .switchMap(() => {
      return this.store.select(fromRoot.getNodes).take(1);
    })
    .switchMap(oldNodes => {
      return this.fileService.loadNodesFile(oldNodes)
        .map(nodes => new app.LoadNodesSuccessAction(nodes))
        .catch(err => {
          return of(new app.LoadNodesFailureAction(err));
        });
    });

  @Effect()
  loadSources$: Observable<Action> = this.actions$
    .ofType(app.LOAD_SOURCES_FILE)
    .switchMap(() => {
      return this.store.select(fromRoot.getNodes).take(1);
    })
    .switchMap(oldNodes => {
      return this.fileService.loadSourcesFile(oldNodes)
        .map(nodes => new app.LoadSourcesSuccessAction(nodes))
        .catch(err => {
          return of(new app.LoadSourcesFailureAction(err));
        });
    });

  @Effect()
  beginSummarizeNetworks$: Observable<Action> = this.actions$
    .ofType(app.LOAD_NETWORKS_SUCCESSFUL, app.SET_BURNIN)
    .debounceTime(200)
    .switchMap(() => {
      return of(new app.BeginSummarizeNetwork);
    });

  @Effect()
  summarizeNetworks$: Observable<Action> = this.actions$
    .ofType(app.BEGIN_SUMMARIZE_NETWORK)
    .switchMap(() => {
      const networkTransitions = this.store.select(fromRoot.getNetworkTransitions).take(1);
      const burnin = this.store.select(fromRoot.getBurnin).take(1);
      const nodes = this.store.select(fromRoot.getNodesByIndex).take(1);
      return forkJoin(networkTransitions, burnin, nodes);
    })
    .switchMap(([networkTransitions, burnin, nodes]: [NetworkTransition[], number, NodeByIndexSet]) => {
      if (networkTransitions.length === 0 || burnin > networkTransitions.length) {
        return of(new app.SummarizeNetworkAction([]));
      } else {
        return this.fileService.summarizeNetwork(burnin, networkTransitions, nodes)
        .map(networkSummary => {
          
          return new app.SummarizeNetworkAction(networkSummary);
        })
        .catch(err => {
          return of(new app.SummarizeNetworkAction([]));
        });
      }
    });

  constructor(private actions$: Actions, private fileService: FileService, private store: Store<fromRoot.State>) { }

}
