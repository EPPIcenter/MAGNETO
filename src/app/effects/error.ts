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
import { MdSnackBar } from '@angular/material';

import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import * as app from '../actions/app';


@Injectable()
export class ErrorEffects {

  @Effect({ dispatch: false })
  actionFailure$: Observable<void> = this.actions$
    .ofType(app.ACTION_FAILURE)
    .map(toPayload)
    .map(err => {
      this.snackBar.open(err, null, {
        duration: 5000
      });
    });

  constructor(private actions$: Actions, private store: Store<fromRoot.State>, private snackBar: MdSnackBar) { }

}
