import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import { NodeSet, Node, NodeByIndexSet,
         NetworkTransitionSequence, Edge } from '../models/network';

import * as app from '../actions/app';

export interface State {
  loadingSources: boolean;
  loadingNodes: boolean;
  loadingNetworks: boolean;
  summarizingNetworks: boolean;
  loadSourcesError: string | null;
  loadNodesError: string | null;
  loadNetworksError: string | null;
  sourcesLoaded: boolean;
  nodesLoaded: boolean;
  networksLoaded: boolean;
  nodes: NodeSet;
  networkTransitions: NetworkTransitionSequence;
  categoricalFeatures: string[];
  continuousFeatures: string[];
  burnin: number;
  transmissionThreshold: number;
  selectedNode: number | null;
  networkSummary: Edge[];
  renderSources: boolean;
  renderIsolatedNodes: boolean;
}

export const initialState: State = {
  loadingSources: false,
  loadingNodes: false,
  loadingNetworks: false,
  summarizingNetworks: false,
  loadSourcesError: null,
  loadNodesError: null,
  loadNetworksError: null,
  sourcesLoaded: false,
  nodesLoaded: false,
  networksLoaded: false,
  nodes: {},
  networkTransitions: [],
  categoricalFeatures: [],
  continuousFeatures: [],
  burnin: 0,
  transmissionThreshold: 0.5,
  selectedNode: null,
  networkSummary: [],
  renderSources: true,
  renderIsolatedNodes: false
};

export function reducer(state = initialState, action: app.Actions): State {
  switch (action.type) {
    case app.LOAD_SOURCES_FILE:
      return Object.assign({}, state, {loadingSources: true, selectedNode: null, sourcesLoaded: false});

    case app.LOAD_SOURCES_SUCCESSFUL:
      const nodesWithSources = action.payload;
      return Object.assign({}, state, {
        nodes: nodesWithSources,
        loadingSources: false,
        sourcesLoaded: true,
        networkTransitions: [],
        networkSummary: [],
        networksLoaded: false
      });

    case app.LOAD_SOURCES_FAILURE:
      const loadSourcesError = action.payload;
      return Object.assign({}, state, {loadingSources: false, loadSourcesError: loadSourcesError});

    case app.LOAD_NODES_FILE:
      return Object.assign({}, state, {loadingNodes: true, selectedNode: null, nodesLoaded: false});

    case app.LOAD_NODES_SUCCESSFUL:
      const newNodes = action.payload;
      return Object.assign({}, state, {
        nodes: newNodes,
        loadingNodes: false,
        nodesLoaded: true,
        networkTransitions: [],
        networkSummary: [],
        networksLoaded: false
      });

    case app.LOAD_NODES_FAILURE:
      const loadNodesError = action.payload;
      return Object.assign({}, state, {loadingNodes: false, loadNodesError: loadNodesError});

    case app.LOAD_NETWORKS_FILE:
      return Object.assign({}, state, {
        loadingNetworks: true,
        selectedNode: null,
        networksLoaded: false,
        burnin: 0,
        transmissionThreshold: 0.5
      });

    case app.LOAD_NETWORKS_SUCCESSFUL:
      const networkTransitions = action.payload;
      return Object.assign({}, state, {
        networkTransitions: networkTransitions,
        loadingNetworks: false,
        networksLoaded: true
      });

    case app.LOAD_NETWORKS_FAILURE:
      const loadNetworksError = action.payload;
      return Object.assign({}, state, {loadingNetworks: false, loadNetworksError: loadNetworksError});

    case app.SET_BURNIN:
      const burnin = action.payload;
      return Object.assign({}, state, {burnin: burnin});

    case app.SET_TRANSMISSION_THRESHOLD:
      const transmissionThreshold = action.payload;
      return Object.assign({}, state, {transmissionThreshold: transmissionThreshold});

    case app.SELECT_NODE:
      const selectedNodeIndex = action.payload;
      return Object.assign({}, state, {selectedNode: selectedNodeIndex});

    case app.DESELECT_NODE:
      return Object.assign({}, state, {selectedNode: null});

    case app.BEGIN_SUMMARIZE_NETWORK:
      return Object.assign({}, state, {summarizingNetworks: true});

    case app.SUMMARIZE_NETWORK:
      const networkSummary = action.payload;
      return Object.assign({}, state, {networkSummary: networkSummary, summarizingNetworks: false});

    case app.TOGGLE_RENDER_SOURCE:
      const renderSourceState = action.payload;
      if (renderSourceState !== null && renderSourceState !== undefined) {
        return Object.assign({}, state, {renderSources: renderSourceState});
      } else {
        return Object.assign({}, state, {renderSources: !state.renderSources});
      }

    case app.TOGGLE_RENDER_ISOLATED_NODES:
      const renderIsolatedNodesState = action.payload;
      if (renderIsolatedNodesState !== null && renderIsolatedNodesState !== undefined) {
        return Object.assign({}, state, {renderIsolatedNodes: renderIsolatedNodesState});
      } else {
        return Object.assign({}, state, {renderIsolatedNodes: !state.renderIsolatedNodes});
      }

    default:
      return state;
  }
};

export const getLoadingSources = (state: State) => state.loadingSources;

export const getLoadingNodes = (state: State) => state.loadingNodes;

export const getLoadingNetworks = (state: State) => state.loadingNetworks;

export const getSummarizingNetworks = (state: State) => state.summarizingNetworks;

export const getSourcesLoaded = (state: State) => state.sourcesLoaded;

export const getNodesLoaded = (state: State) => state.nodesLoaded;

export const getNetworksLoaded = (state: State) => state.networksLoaded;

export const getLoadSourcesError = (state: State) => state.loadSourcesError;

export const getLoadNodesError = (state: State) => state.loadNodesError;

export const getLoadNetworksError = (state: State) => state.loadNetworksError;

export const getNodes = (state: State) => state.nodes;

export const getNetworkTransitions = (state: State) => state.networkTransitions;

export const getBurnin = (state: State) => state.burnin;

export const getTransmissionThreshold = (state: State) => state.transmissionThreshold;

export const getSelectedNodeIndex = (state: State) => state.selectedNode;

export const getNetworkSummaryByIndex = (state: State) => state.networkSummary;

export const getRenderSources = (state: State) => state.renderSources;

export const getRenderIsolatedNodes = (state: State) => state.renderIsolatedNodes;

export const getSources = createSelector(getNodes, (nodes) : Node[] => {
  return Object.keys(nodes).filter(label => { return nodes[label].isSource; }).map(label => nodes[label]);
});

export const getNodesByIndex = createSelector(getNodes, (nodes) : NodeByIndexSet => {
  return Object.keys(nodes).reduce((nodesByIndex: {[index: number]: Node}, nodeLabel: string) => {
    const nodeByIndex = {
      [nodes[nodeLabel].nodeIndex]: nodes[nodeLabel]
    };
    return Object.assign({}, nodesByIndex, nodeByIndex);
  }, {});
});

export const getNetworkSummary = createSelector(
  getTransmissionThreshold,
  getNodesByIndex,
  getNetworkSummaryByIndex,
  getRenderSources,
  (txThreshold, nodes, networkSummary, renderSources) => {
    networkSummary = networkSummary.filter(edge => {
      const n = nodes[<number> edge.source];
      return (edge.weight > txThreshold) && (n.isSource && renderSources || !n.isSource);
    });
    return networkSummary;
});

export const getRenderedNodes = createSelector(getNodes, getRenderSources, getRenderIsolatedNodes, getNetworkSummary, (nodes, renderSources, renderIsolatedNodes, networkSummary) => {
  let renderedNodes = Object.keys(nodes)
    .map(label => nodes[label])
    .filter(n => (n.isSource && renderSources) || !n.isSource)
  if (!renderIsolatedNodes) {
    const validEdges = new Set();
    networkSummary.forEach(edge => {
      validEdges.add(edge.source);
      validEdges.add(edge.target);
    });
    if (validEdges.size > 0) {
      renderedNodes = renderedNodes.filter(node => {
        return validEdges.has(node.nodeIndex);
      });
    }
  }
  return renderedNodes;
});

export const getRenderedEdges = createSelector(getRenderedNodes, getNetworkSummary, (renderedNodes, edges) => {
  const renderedNodeIndices = {};
  renderedNodes.forEach((node, idx) => {
    renderedNodeIndices[node.nodeIndex] = idx;
  });
  const renderedEdges = edges.map(edge => {
    return {
      source: renderedNodeIndices[<number> edge.source],
      target: renderedNodeIndices[<number> edge.target],
      weight: edge.weight
    };
  });
  return renderedEdges;
});

export const getSelectedNode = createSelector(getNodesByIndex, getSelectedNodeIndex, (nodes, idx) => nodes[idx] ? nodes[idx] : null);

export const getNetworkCount = createSelector(getNetworkTransitions, (transitions) => {
  return transitions.length;
});

export const getSelectedNodeParents = createSelector(
  getSelectedNodeIndex, getNodesByIndex, getNetworkSummary, (selectedNodeIndex, nodesByIndex, edges) => {
    if (edges !== [] && selectedNodeIndex !== null && nodesByIndex !== {}) {
      const parentNodes = edges.filter(edge => {
        return (edge.target === selectedNodeIndex) && !(nodesByIndex[<number> edge.source].isSource);
      })
      .map(edge => nodesByIndex[<number> edge.source]);
      return parentNodes;
    } else {
      return [];
    }
});
