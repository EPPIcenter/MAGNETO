import { Injectable } from '@angular/core';
import { remote } from 'electron';
import { Observable } from 'rxjs/Observable';
import { defer } from 'rxjs/observable/defer';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/observable/of';
import * as fs from 'fs';

import { Node, Edge, StringEdge, StringEdgeList, EdgeList,
         NetworkTransition, NetworkTransitionSequence, NodeByIndexSet } from '../models/network';


@Injectable()
export class FileService {
  private EDGE_FORMAT = ['from', 'k', 'to'];

  loadNetworkFile(nodes: {[label: string]: Node}): Observable<NetworkTransitionSequence> {
    const filenames = remote.dialog.showOpenDialog({title: 'Select a network file', properties: ['openFile']});
    if (!filenames) {
      return Observable.of([]);
    }
    const rs = fs.createReadStream(filenames[0], {encoding: 'utf-8'});
    const networkTransitions: NetworkTransitionSequence = [];
    let edgeList = new Set<number>();
    let total = 0;
    let buffer = '';
    const transitionMatrix: number[] = Array(Object.keys(nodes).length ** 2).fill(0);

    return Observable.create((observer: Observer<NetworkTransitionSequence>) => {
      rs.on('data', (chunk) => {
        const chunkSize = chunk.length;
        let c, cc;
        for (let i = 0; i < chunkSize; i++) {
          c = chunk[i];
          // Look ahead for windows newline
          if (i < chunkSize - 1) {
            cc = c + chunk[i + 1];
          } else {
            cc = '';
          }
          // Check for newline
          if (cc === '\r\n' || c === '\n') {
            const network = this._parseNetworkBuffer(buffer);
            if (network) {
              let transition;
              [transition, edgeList] = this._calculateTransition(edgeList, network, nodes);
              networkTransitions.push(transition);
            }
            buffer = '';
            if (cc === '\r\n') {
              i++;
            }
          } else {
            buffer = buffer + c;
          }
        }
        total += chunk.length;
      });

      rs.on('end', () => {
        // Parse last bit of buffer if file did not end with newline
        const network = this._parseNetworkBuffer(buffer);
        if (network) {
          let transition;
          [transition, edgeList] = this._calculateTransition(edgeList, network, nodes);
          networkTransitions.push(transition);
        }
        observer.next(networkTransitions);
        observer.complete();
      });

    });

  }

  loadNodesFile(nodes: {[label: string]: Node}): Observable<{[label: string]: Node}> {
    const filenames = remote.dialog.showOpenDialog({title: 'Select a nodes file', properties: ['openFile']});
    if (!filenames) {
      return Observable.of({});
    }
    const rs = fs.createReadStream(filenames[0], {encoding: 'utf-8'});
    let header = [];
    const newNodes: {[label: string]: Node} = {};
    let buffer = '';
    let node_entry: Node;
    let node_index = Object.keys(nodes).length;
    let label_index = Object.keys(nodes).map(k => nodes[k]).filter(node => !node.isSource).length + 1;

    return Observable.create((observer: Observer<{[label: string]: Node}>) => {
      rs.on('data', (chunk) => {
        const chunkSize = chunk.length;
        let c, cc;
        for (let i = 0; i < chunkSize; i++) {
          c = chunk[i];
          if (i < chunkSize - 1) {
            cc = c + chunk[i + 1];
          } else {
            cc = '';
          }
          if (cc === '\r\n' || c === '\n') {
            if (header.length > 0) {
              node_entry = this._parseNodeEntryBuffer(buffer, header);
              node_entry.nodeIndex = node_index;
              if (!node_entry.label) {
                node_entry.label = label_index.toString();
                label_index++;
              }
              node_index++;
              newNodes[node_entry.label] = node_entry;
            } else {
              header = this._parseNodeHeaderBuffer(buffer);
            }
            if (cc === '\r\n') {
              i++;
            }
            buffer = '';
          } else {
            buffer = buffer + c;
          }
        }
      });

      rs.on('end', () => {
        if (buffer.length > 0 && header.length > 0) {
          node_entry = this._parseNodeEntryBuffer(buffer, header);
          node_entry.nodeIndex = node_index;
          if (!node_entry.label) {
            node_entry.label = label_index.toString();
            label_index++;
          }
          node_index++;
          newNodes[node_entry.label] = node_entry;
        }
        nodes = Object.assign({}, nodes, newNodes);
        observer.next(nodes);
        observer.complete();
      });

    });
  }

  loadSourcesFile(nodes: {[label: string]: Node}): Observable<{[label: string]: Node}> {
    const filenames = remote.dialog.showOpenDialog({title: 'Select a sources file', properties: ['openFile']});
    if (!filenames) {
      return Observable.of({});
    }
    const rs = fs.createReadStream(filenames[0], {encoding: 'utf-8'});
    const newSources: {[label: string]: Node} = {};
    let buffer = '';
    let node_index = Object.keys(nodes).length;

    return Observable.create((observer: Observer<{[label: string]: Node}>) => {
      rs.on('data', (chunk) => {
        const chunkSize = chunk.length;
        let c, cc;
        for (let i = 0; i < chunkSize; i++) {
          c = chunk[i];
          if (i < chunkSize - 1) {
            cc = c + chunk[i + 1];
          } else {
            cc = '';
          }
          if (cc === '\r\n' || c === '\n') {
            const sourceEntry = this._parseSourceEntryBuffer(buffer);
            if (!newSources.hasOwnProperty(sourceEntry.label)) {
              newSources[sourceEntry.label] = {
                label: sourceEntry.label,
                time: 0,
                symptomType: null,
                nodeIndex: node_index,
                alleles: {},
                features: {},
                isSource: true
              };
              node_index++;
            }
            newSources[sourceEntry.label].alleles[sourceEntry.locus] = sourceEntry.alleles;
            if (cc === '\r\n') {
              i++;
            }
            buffer = '';
          } else {
            buffer = buffer + c;
          }
        }
      });

      rs.on('end', () => {
        if (buffer.length > 0) {
          const sourceEntry = this._parseSourceEntryBuffer(buffer);
          if (!newSources.hasOwnProperty(sourceEntry.label)) {
            newSources[sourceEntry.label] = {
              label: sourceEntry.label,
              time: 0,
              symptomType: null,
              nodeIndex: node_index,
              alleles: {},
              features: {},
              isSource: true
            };
            node_index++;
          }
          newSources[sourceEntry.label].alleles[sourceEntry.locus] = sourceEntry.alleles;
        }
        observer.next(Object.assign({}, nodes, newSources));
        observer.complete();
      });
    });
  }

  getNetwork(transitions: NetworkTransitionSequence, index: number): EdgeList {
    const network = new Set<number>();
    for (let i = 0; i < index; i++) {
      const transition = transitions[i];
      transition.add.forEach(j => network.add(j));
      transition.remove.forEach(j => network.delete(j));
    }
    return network;
  }

  indexToEdge(index: number, totalNodes: number): {source: number, target: number, index: number} {
    const source = Math.floor(index / totalNodes);
    const target = index % totalNodes;
    return {
      source: source,
      target: target,
      index: index
    };
  }

  createNodesByIndex(nodes: {[label: string]: Node}): {[index: number]: Node} {
    return Object.keys(nodes).map(k => nodes[k]).reduce((byIndex: {[index: number]: Node}, node) => {
      return Object.assign(byIndex, {[node.nodeIndex]: node});
    }, {});
  };

  summarizeNetwork(burnin: number, networkTransitions: NetworkTransitionSequence, nodes: NodeByIndexSet): Observable<Edge[]> {
    // const networkSummary = [];
    const numCores = navigator.hardwareConcurrency;
    const workerObservables: Observable<any>[] = [];
    const startingNetwork = this.getNetwork(networkTransitions, burnin + 1);
    const increment = 1 / (networkTransitions.length - burnin);
    let i = 0;
    const transitions = networkTransitions.slice(burnin, networkTransitions.length);
    while (i < numCores) {
      const subsetSize = transitions.length / numCores;
      const transitionSubset = transitions.slice(i * subsetSize, (i + 1) * (subsetSize));
      const message = JSON.stringify({
        increment: increment,
        transitions: transitionSubset,
        nodes: nodes
      });
      const worker = new Worker('./workers/files-worker.js');
      const workerObservable = Observable.create((observer: Observer<any>) => {
        worker.postMessage(message);
        worker.addEventListener('message', m => {
          observer.next(JSON.parse(m.data));
          observer.complete();
          worker.removeEventListener('message');
        });
      });
      workerObservables.push(workerObservable);
      i++;
    }

    const edgeObservable = Observable.forkJoin(...workerObservables)
      .map((partialNetworkMaps: {[idx: number]: number}[]) => {
        const networkMap = {};
        partialNetworkMaps.forEach((partialNetworkMap, j) => {
          Object.keys(partialNetworkMap).forEach(idx => {
            if (networkMap.hasOwnProperty(idx)) {
              networkMap[idx] = networkMap[idx] + partialNetworkMap[idx];
            } else {
              networkMap[idx] = partialNetworkMap[idx];
            }
          });
        });
        return networkMap;
      })
      .map(networkMap => {
        const networkSummary: Edge[] = [];
        const totalNodes = Object.keys(nodes).length;
        Object.keys(networkMap).forEach(idx => {
          const e = this.indexToEdge(+idx, totalNodes);
          e['weight'] = networkMap[idx];
          networkSummary.push(e);
        });
        return networkSummary;
      });
    return edgeObservable;
  }

  private _parseNetworkBuffer(buffer): StringEdgeList {
    if (buffer.length > 0) {
      const edgeList: StringEdgeList = [];

      let edge: StringEdge = ['', 0, ''];
      let c: string;
      let lookahead: string;
      let edgePos = 0;

      for (let i = 0; i < buffer.length - 1; i++) {
        c = buffer[i];
        lookahead = buffer[i + 1];
        if (lookahead === '-') {
          edge[edgePos] = edge[edgePos] + c;
          i++;
          edgePos++;
        } else if (lookahead === ';') {
          edge[edgePos] = edge[edgePos] + c;
          i++;
          edgePos = 0;
          edge[1] = +edge[1];
          edgeList.push(edge);
          edge = ['', 0, ''];
        } else {
          edge[edgePos] = edge[edgePos] + c;
        }
      }
      return edgeList;
    }
  }

  private _parseNodeEntryBuffer(buffer, header: string[]): Node {
    const node: Node = {
      label: null,
      time: null,
      nodeIndex: null,
      symptomType: null,
      alleles: {},
      features: {},
      isSource: false
    };
    let c: string;
    let headerIndex = 0;
    let fieldLabel: string;
    let field = '';

    for (let i = 0; i < buffer.length; i++) {
      c = buffer[i];
      fieldLabel = header[headerIndex];
      if (c === ',' && field.length > 0) {
        if (fieldLabel === 'time' || fieldLabel === 'Time') {
          node.time = +field;
        } else if (fieldLabel === 'label' || fieldLabel === 'Label') {
          node.label = field;
        } else if (fieldLabel === 'type' || fieldLabel === 'Type') {
          node.symptomType = fieldLabel;
        } else {
          // convert to string, remove any character that isn't 1 or 0, split, and cast to integers
          node.alleles[fieldLabel] = field.replace(/[^01]/gi, '').split('').map(a => +a);
        }
        headerIndex++;
        field = '';
      } else {
        field = field + c;
      }
    }

    if (field.length > 0) {
      fieldLabel = header[headerIndex];
      if (fieldLabel === 'time' || fieldLabel === 'Time') {
        node.time = +field;
      } else if (fieldLabel === 'label' || fieldLabel === 'Label') {
        node.label = field;
      } else {
        // convert to string, remove any character that isn't 1 or 0, split, and cast to integers
        node.alleles[fieldLabel] = field.replace(/[^01]/gi, '').split('').map(a => +a);
      }
    }
    return node;
  }

  private _parseNodeHeaderBuffer(buffer): string[] {
    const header = [];
    let c: string;
    let field = '';

    for (let i = 0; i < buffer.length; i++) {
      c = buffer[i];
      if (c === ',' && field.length > 0) {
        header.push(field);
        field = '';
      } else {
        field = field + c;
      }
    }

    if (field.length > 0) {
      header.push(field);
    }
    return header;
  }

  private _parseSourceEntryBuffer(buffer): {label: string, locus: string, alleles: number[]} {
    const source = {
      label: null,
      locus: null,
      alleles: []
    };
    let c: string;
    let field = '';

    for (let i = 0; i < buffer.length; i++) {
      c = buffer[i];
      if (c === ',' && field.length > 0) {
        if (!source.label) {
          source.label = field;
        } else if (!source.locus) {
          source.locus = field;
        } else {
          field = field.replace(/[^0-9.]/g, '');
          if (field.length > 0) {
            source.alleles.push(+field);
          }
        }
        field = '';
      } else {
        field = field + c;
      }
    }

    if (field.length > 0) {
      source.alleles.push(+field.replace(/[^0-9.]/g, ''));
    }

    return source;
  }

  private _calculateTransition(edgeList: Set<number>, network: StringEdgeList,
                               nodes: {[label: string]: Node}): [NetworkTransition, Set<number>] {
    const newEdgeList = new Set<number>();
    const networkTransition = {
      add: [],
      remove: []
    };
    const totalNodes = Object.keys(nodes).length;
    network.forEach(edge => {
      const from = edge[0];
      const to = edge[2];
      const edgeIdx = nodes[from].nodeIndex * totalNodes + nodes[to].nodeIndex;
      newEdgeList.add(edgeIdx);
      if (!edgeList.has(edgeIdx)) {
        networkTransition.add.push(edgeIdx);
      }
    });
    edgeList.forEach(idx => {
      if (!newEdgeList.has(idx)) {
        networkTransition.remove.push(idx);
      }
    });

    return [networkTransition, newEdgeList];
  }
}

