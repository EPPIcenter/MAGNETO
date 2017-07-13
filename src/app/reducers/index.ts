import { createSelector } from 'reselect';
import { ActionReducer } from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import { environment } from '../../environments/environment';
import { compose } from '@ngrx/core/compose';
import { storeFreeze } from 'ngrx-store-freeze';
import { combineReducers } from '@ngrx/store';

import * as fromApp from './app';

export interface State {
  app: fromApp.State;
};

const reducers = {
  app: fromApp.reducer
};

const developmentReducer: ActionReducer<State> = compose(storeFreeze, combineReducers)(reducers);
const productionReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
};

// App State
export const getAppState = (state: State) => state.app;

export const getLoadingSources = createSelector(getAppState, fromApp.getLoadingSources);
export const getLoadingNodes = createSelector(getAppState, fromApp.getLoadingNodes);
export const getLoadingNetworks = createSelector(getAppState, fromApp.getLoadingNetworks);
export const getSummarizingNetworks = createSelector(getAppState, fromApp.getSummarizingNetworks);
export const getSourcesLoaded = createSelector(getAppState, fromApp.getSourcesLoaded);
export const getNodesLoaded = createSelector(getAppState, fromApp.getNodesLoaded);
export const getNetworksLoaded = createSelector(getAppState, fromApp.getNetworksLoaded);
export const getLoadSourcesError = createSelector(getAppState, fromApp.getLoadSourcesError);
export const getLoadNodesError = createSelector(getAppState, fromApp.getLoadNodesError);
export const getLoadNetworksError = createSelector(getAppState, fromApp.getLoadNetworksError);
export const getNodes = createSelector(getAppState, fromApp.getNodes);
export const getNodesByIndex = createSelector(getAppState, fromApp.getNodesByIndex);
export const getNetworkTransitions = createSelector(getAppState, fromApp.getNetworkTransitions);
export const getBurnin = createSelector(getAppState, fromApp.getBurnin);
export const getTransmissionThreshold = createSelector(getAppState, fromApp.getTransmissionThreshold);
export const getSelectedNode = createSelector(getAppState, fromApp.getSelectedNode);
export const getNetworkCount = createSelector(getAppState, fromApp.getNetworkCount);
export const getNetworkSummary = createSelector(getAppState, fromApp.getNetworkSummary);
export const getRenderedNodes = createSelector(getAppState, fromApp.getRenderedNodes);
export const getRenderedEdges = createSelector(getAppState, fromApp.getRenderedEdges);
export const getRenderSources = createSelector(getAppState, fromApp.getRenderSources);
export const getRenderIsolatedNodes = createSelector(getAppState, fromApp.getRenderIsolatedNodes);
export const getSelectedNodeParents = createSelector(getAppState, fromApp.getSelectedNodeParents);
