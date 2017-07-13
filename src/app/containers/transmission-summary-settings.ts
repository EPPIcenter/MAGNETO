import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkjoin';

import * as fromRoot from '../reducers';
import * as _ from 'lodash';

import { FileService } from '../services/files';
import { Node, NetworkTransition, NetworkTransitionSequence, NodeSet, NodeByIndexSet } from '../models/network';
import * as app from '../actions/app';

@Component({
  selector: 'mgn-transmission-summary-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-card>
      <md-card-title>
        Summary Settings
      </md-card-title>
      <md-card-content>
        <md-input-container>
          <input mdInput #burnin
            (keyup.enter)="saveSettings(burnin.value, txThreshold.value)"
            type="number"
            min="0"
            placeholder="Burnin: {{burnin$ | async}}/{{transmissionNetworkCount$ | async}}"
            value="{{burnin$ | async}}"
            >
        </md-input-container>
        <br>
        <md-input-container>
          <input mdInput #txThreshold
            (keyup.enter)="saveSettings(+burnin.value, +txThreshold.value)"
            type="number"
            min="0"
            max="1"
            step=".01"
            placeholder="Tx Threshold: {{transmissionThreshold$ | async}}"
            value="{{transmissionThreshold$ | async}}">
        </md-input-container>
      </md-card-content>
      <md-card-actions>
        <mgn-control-button
          title="SAVE SETTINGS"
          busyTitle="Summarizing Network..."
          [busy]="summarizingNetwork$ | async"
          [disabledConditions]="[!(networksLoaded$ | async)]"
          (clicked)="saveSettings(+burnin.value, +txThreshold.value)">
        </mgn-control-button>
      </md-card-actions>
    </md-card>
  `,
  styles: [`
    md-input-container {
      width: 100%;
    }
  `]
})
export class TransmissionSummarySettingsComponent {
  burnin$: Observable<number>;
  transmissionThreshold$: Observable<number>;
  transmissionNetworkCount$: Observable<number>;
  summarizingNetwork$: Observable<boolean>;
  networksLoaded$: Observable<boolean>;

  constructor(private store: Store<fromRoot.State>) {
    this.burnin$ = this.store.select(fromRoot.getBurnin);
    this.transmissionThreshold$ = this.store.select(fromRoot.getTransmissionThreshold);
    this.transmissionNetworkCount$ = this.store.select(fromRoot.getNetworkCount);
    this.summarizingNetwork$ = this.store.select(fromRoot.getSummarizingNetworks);
    this.networksLoaded$ = this.store.select(fromRoot.getNetworksLoaded);
  }

  saveSettings(burnin: number, txThreshold: number) {
    burnin = +burnin;
    txThreshold = + txThreshold;
    Observable.forkJoin(this.transmissionNetworkCount$.take(1), this.transmissionThreshold$.take(1), this.burnin$.take(1)).subscribe(
      res => {
        const [count, oldThresh, oldBurnin] = res;
        if (count > burnin) {
          if (burnin !== oldBurnin) {
            this.store.dispatch(new app.SetBurninAction(burnin));
          }
        } else {
          this.store.dispatch(new app.ActionFailure('Burnin Cannot Exceed Network Count'));
        }

        if (0 <= txThreshold && txThreshold <= 1) {
          if (txThreshold !== oldThresh) {
            this.store.dispatch(new app.SetTransmissionThresholdAction(txThreshold));
          }
        } else {
          this.store.dispatch(new app.ActionFailure('Tx Threshold must be between 0 and 1'));
        }
      }
    );
  }

}
