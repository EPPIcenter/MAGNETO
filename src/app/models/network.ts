import * as d3 from 'd3';

export type StringEdge = [string, number, string];

export interface Edge extends d3.SimulationLinkDatum<Node> {
  source: number | Node;
  target: number | Node;
  nodeIndex?: number;
  weight?: number | null;
};

export type StringEdgeList = StringEdge[];

export type EdgeList = Set<number>;

export interface NetworkTransition {
  add: number[];
  remove: number[];
}

export type NetworkTransitionSequence = NetworkTransition[];

export interface Node extends d3.SimulationNodeDatum {
// export interface Node {
  label: string;
  time: number;
  symptomType: string;
  nodeIndex: number;
  alleles: {[locus: string]: number[]};
  features: { [feature: string]: number | string };
  isSource: boolean;
  color?: string | null;
  edgeWidth?: number | null;
  size?: number | null;
}

export interface NodeSet {
  [label: string]: Node;

};

export interface NodeByIndexSet {
  [nodeIndex: number]: Node;
}
