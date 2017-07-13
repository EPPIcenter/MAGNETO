import { Action } from '@ngrx/store';
import { Node, NodeSet, NetworkTransition, NetworkTransitionSequence, Edge } from '../models/network';


export const LOAD_SOURCES_FILE = '[App] Load Sources File';
export const LOAD_SOURCES = '[App] Load Sources';
export const LOAD_SOURCES_SUCCESSFUL = '[App] Load Sources Successful';
export const LOAD_SOURCES_FAILURE = '[App] Load Sources Failure';
export const LOAD_NODES_FILE = '[App] Load Nodes File';
export const LOAD_NODES = '[App] Load Nodes';
export const LOAD_NODES_SUCCESSFUL = '[App] Load Nodes Successful';
export const LOAD_NODES_FAILURE = '[App] Load Nodes Failure';
export const LOAD_NETWORKS_FILE = '[App] Load Networks File';
export const LOAD_NETWORKS = '[App] Load Networks';
export const LOAD_NETWORKS_SUCCESSFUL = '[App] Load Networks Successful';
export const LOAD_NETWORKS_FAILURE = '[App] Load Networks Failure';
export const SET_BURNIN = '[App] Set Burnin';
export const SET_TRANSMISSION_THRESHOLD = '[App] Set Transmission Threshold';
export const SELECT_NODE = '[App] Select Node';
export const DESELECT_NODE = '[App] Deselect Node';
export const BEGIN_SUMMARIZE_NETWORK = '[App] Begin Summarize Network';
export const SUMMARIZE_NETWORK = '[App] Summarize Network';
export const ACTION_FAILURE = '[App] Action Failure';
export const TOGGLE_RENDER_SOURCE = '[App] Toggle Render Source';
export const TOGGLE_RENDER_ISOLATED_NODES = '[App] TOggle Render Isolated Nodes';


export class LoadSourcesFileAction implements Action {
  readonly type = LOAD_SOURCES_FILE;
  constructor() {};
}

export class LoadSourcesAction implements Action {
  readonly type = LOAD_SOURCES;
  constructor(public payload: NodeSet) {};
}

export class LoadSourcesSuccessAction implements Action {
  readonly type = LOAD_SOURCES_SUCCESSFUL;
  constructor(public payload: NodeSet) {};
}

export class LoadSourcesFailureAction implements Action {
  readonly type = LOAD_SOURCES_FAILURE;
  constructor(public payload: string) {};
}

export class LoadNodesFileAction implements Action {
  readonly type = LOAD_NODES_FILE;
  constructor() {};
}

export class LoadNodesAction implements Action {
  readonly type = LOAD_NODES;
  constructor(public payload: NodeSet) {};
}

export class LoadNodesSuccessAction implements Action {
  readonly type = LOAD_NODES_SUCCESSFUL;
  constructor(public payload: NodeSet) {};
}

export class LoadNodesFailureAction implements Action {
  readonly type = LOAD_NODES_FAILURE;
  constructor(public payload: string) {};
}

export class LoadNetworksFileAction implements Action {
  readonly type = LOAD_NETWORKS_FILE;
  constructor() {};
}

export class LoadNetworksAction implements Action {
  readonly type = LOAD_NETWORKS;
  constructor(public payload: NodeSet) {};
}

export class LoadNetworksSuccessAction implements Action {
  readonly type = LOAD_NETWORKS_SUCCESSFUL;
  constructor(public payload: NetworkTransitionSequence) {};
}

export class LoadNetworksFailureAction implements Action {
  readonly type = LOAD_NETWORKS_FAILURE;
  constructor(public payload: string) {};
}

export class SetBurninAction implements Action {
  readonly type = SET_BURNIN;
  constructor(public payload: number) {};
}

export class SetTransmissionThresholdAction implements Action {
  readonly type = SET_TRANSMISSION_THRESHOLD;
  constructor(public payload: number) {};
}

export class SelectNodeAction implements Action {
  readonly type = SELECT_NODE;
  constructor(public payload: number) {};
}

export class DeselectNodeAction implements Action {
  readonly type = DESELECT_NODE;
  constructor() {};
}

export class BeginSummarizeNetwork implements Action {
  readonly type = BEGIN_SUMMARIZE_NETWORK;
  constructor() {};
}

export class SummarizeNetworkAction implements Action {
  readonly type = SUMMARIZE_NETWORK;
  constructor(public payload: Edge[]) {};
}

export class ActionFailure implements Action {
  readonly type = ACTION_FAILURE;
  constructor(public payload: string) {};
}

export class ToggleRenderSourceAction implements Action {
  readonly type = TOGGLE_RENDER_SOURCE;
  constructor(public payload: boolean | null) {};
}

export class ToggleRenderIsolatedNodes implements Action {
  readonly type = TOGGLE_RENDER_ISOLATED_NODES;
  constructor(public payload: boolean | null) {};
}

export type Actions
 = LoadSourcesFileAction
 | LoadSourcesAction
 | LoadSourcesSuccessAction
 | LoadSourcesFailureAction
 | LoadNodesFileAction
 | LoadNodesAction
 | LoadNodesSuccessAction
 | LoadNodesFailureAction
 | LoadNetworksFileAction
 | LoadNetworksAction
 | LoadNetworksSuccessAction
 | LoadNetworksFailureAction
 | SetBurninAction
 | SetTransmissionThresholdAction
 | SelectNodeAction
 | DeselectNodeAction
 | BeginSummarizeNetwork
 | SummarizeNetworkAction
 | ActionFailure
 | ToggleRenderSourceAction
 | ToggleRenderIsolatedNodes;
