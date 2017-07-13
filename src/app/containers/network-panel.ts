import { Component, ChangeDetectionStrategy,
  ViewChild, OnInit, OnChanges, SimpleChanges,
  Output, Input, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Node, NetworkTransition, NetworkTransitionSequence, NodeSet, NodeByIndexSet, Edge } from '../models/network';

type NodeSizeResolver = (node: Node) => number;
type NodeColorResolver = (node: Node) => string;
type NodeEdgeWidthResolver = (node: Node) => number;

@Component({
  selector: 'mgn-network-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container" (window:resize)="onResize($event)" #handle>
      <canvas fxFlex #canvas></canvas>
    </div>
  `,
  styles: [`
    canvas {
      position: absolute;
    }
    .container {
      height: 100%;
    }
  `]
})
export class NetworkPanelComponent implements OnInit {
  @ViewChild('handle') handle;
  @ViewChild('canvas') canvasRef;
  @Output() selectNode = new EventEmitter();

  private _searchRadius = 10;
  private _nodes: Node[] = [];

  @Input()
  set nodes(nodes: Node[]) {
    this._nodes = nodes.map(node => {
      return Object.assign({}, node, {
        x: node.x || 0,
        y: node.y || 0,
        color: typeof(this.nodeColor) === 'function' ? this.nodeColor.apply(this, [node]) : this.nodeColor,
        edgeWidth: typeof(this.nodeEdgeWidth) === 'function' ? this.nodeEdgeWidth.apply(this, [node]) : this.nodeEdgeWidth,
        size: typeof(this.nodeSize) === 'function' ? this.nodeSize.apply(this, [node]) : this.nodeSize
      });
    });
    if (this.simulation) {
      this.simulation.nodes(this.nodes);
      this.simulation.alpha(0.8).restart();
    }
  }

  get nodes(): Node[] { return this._nodes; }

  private _edges: Edge[] = [];

  @Input()
  set edges(edges: Edge[]) {
    this._edges = edges.map(edge => {
      return Object.assign({}, edge);
    });
    if (this.simulation) {
      this.simulation.force('link', d3.forceLink(this._edges).strength(0.5));
      this.simulation.alpha(0.8).restart();
    }
  }

  get edges(): Edge[] { return this._edges; };

  private _nodeSize: NodeSizeResolver | number = 6;

  @Input()
  set nodeSize(f: NodeSizeResolver | number) {
    this._nodeSize = f;
    this.nodes = this.nodes.map(n => {
      return Object.assign({}, n, {
        size: typeof(this.nodeSize) === 'function' ? this.nodeSize.apply(this, [n]) : this.nodeSize
      });
    });
    this.restartSimulation();
  }

  get nodeSize() { return this._nodeSize; }

  private _nodeColor: NodeColorResolver | string = 'blue';

  @Input()
  set nodeColor(f: NodeColorResolver | string) {
    this._nodeColor = f;
    this.nodes = this.nodes.map(n => {
      return Object.assign({}, n, {
        color: typeof(this.nodeColor) === 'function' ? this.nodeColor.apply(this, [n]) : this.nodeColor
      });
    });
    this.restartSimulation();
  }

  get nodeColor() { return this._nodeColor; }

  private _nodeEdgeWidth: NodeEdgeWidthResolver | number = 1;

  @Input()
  set nodeEdgeWidth(f: NodeEdgeWidthResolver | number) {
    this._nodeEdgeWidth = f;
    this.nodes = this.nodes.map(n => {
      return Object.assign({}, n, {
        edgeWidth: typeof(this.nodeEdgeWidth) === 'function' ? this.nodeEdgeWidth.apply(this, [n]) : this.nodeEdgeWidth
      });
    });
    this.restartSimulation();
  }

  get nodeEdgeWidth() { return this._nodeEdgeWidth; }

  private _selectedNode: Node;
  @Input()
  set selectedNode(n: Node) {
    this._selectedNode = n;
    this.nodes = this._nodes;
    this.edges = this._edges.map(edge => {
      const source = <Node> edge.source;
      const target = <Node> edge.target;
      return Object.assign({}, {
        source: source.index,
        target: target.index,
        weight: edge.weight,
      });
    });
  };
  get selectedNode() { return this._selectedNode; }

  private simulation: d3.Simulation<Node, Edge>;

  restartSimulation() {
    if (this.simulation) {
      this.simulation.alpha(0.8).restart();
    }
  }

  get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  get context(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d');
  }

  onResize(event) {
    this.resizeCanvas();
  }

  getDimensions(): [number, number] {
    const width = this.handle.nativeElement.offsetWidth;
    const height = this.handle.nativeElement.offsetHeight;
    return [width, height];
  }

  resizeCanvas() {
    const [width, height] = this.getDimensions();
    this.canvas.width = width;
    this.canvas.height = height;
    this.restartSimulation();
  }

  clearCanvas() {
    const [width, height] = this.getDimensions();
    this.context.clearRect(0, 0, width, height);
  }

  ngOnInit() {
    const [width, height] = this.getDimensions();
    this.simulation = d3.forceSimulation(this.nodes)
      .force('y', d3.forceY())
      .force('x', d3.forceX())
      .force('charge', d3.forceManyBody()
        .strength(-30)
        .theta(.99))
      .on('tick', (...args) => this.ticked.apply(this, [args]));

    d3.select(this.canvas)
      .call(d3.drag()
          .container(this.canvas)
          .subject((...args) => this.dragsubject.apply(this, [args]))
              .on('start', (...args) => this.dragstarted.apply(this, [args]))
              .on('drag', (...args) => this.dragged.apply(this, [args]))
              .on('end', (...args) => this.dragended.apply(this, [args])))
      .on('mousedown', () => {
        console.log('Canvas Clicked', d3.event.subject);
      })
      .on('dblclick', () => {
        console.log('Canvas Dblclicked');
      });

    setTimeout(() => {
      this.resizeCanvas();
    }, 200);
  }

  dragsubject(): any {
    const [width, height] = this.getDimensions();
    const subject = this.simulation.find(d3.event.x - width / 2, d3.event.y - height / 2, this._searchRadius);
    this.selectNode.emit(subject);
    return subject;
  }

  dragstarted() {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.9).restart();
    }
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  dragended() {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

  ticked() {
    this.clearCanvas();
    this.context.save();
    const [width, height] = this.getDimensions();
    this.context.translate(width / 2, height / 2);
    this.nodes.forEach((node) => this.drawNode.apply(this, [node]));
    this.edges.forEach((edge) => this.drawLink.apply(this, [edge]));
    this.context.restore();
  }

  drawNode(d: Node) {
    this.context.save();
    this.context.moveTo(Math.floor(d.x) + d.size, Math.floor(d.y));
    this.context.beginPath();
    this.context.arc(Math.floor(d.x), Math.floor(d.y), d.size, 0, 2 * Math.PI);
    this.context.strokeStyle = d.color;
    this.context.lineWidth = d.edgeWidth;
    this.context.stroke();
    this.context.restore();
  }

  drawLink(edge: Edge) {
    if (typeof(edge.source) !== 'number' && typeof(edge.target) !== 'number') {
      this.drawArrow(edge.source.x, edge.source.y, edge.target.x, edge.target.y, null, edge.weight);
    } else {
      console.error('Links wrong datatype');
    }
  }

  drawArrow(fromX: number, fromY: number, toX: number, toY: number, color = 'black', opacity = 1) {
      this.context.save();
      const headlen = 2;
      const angle = Math.atan2(toY - fromY, toX - fromX);

      // starting path of the arrow from the start square to the end square and drawing the stroke
      this.context.beginPath();
      this.context.moveTo(Math.floor(fromX), Math.floor(fromY));
      this.context.lineTo(Math.floor(toX), Math.floor(toY));
      this.context.strokeStyle = color;
      this.context.globalAlpha = opacity;
      this.context.lineWidth = 2;
      this.context.stroke();

      //starting a new path from the head of the arrow to one of the sides of the point
      const arrowLen1 = headlen * Math.cos(angle - Math.PI / 7);
      const arrowLen2 = headlen * Math.sin(angle - Math.PI / 7);

      this.context.beginPath();
      this.context.moveTo(toX, toY);
      this.context.lineTo(toX - arrowLen1, toY - arrowLen2);

      // path from the side point of the arrow, to the other side point
      this.context.lineTo(toX - headlen * Math.cos(angle + Math.PI / 7), toY - headlen * Math.sin(angle + Math.PI / 7));

      // path from the side point back to the tip of the arrow, and then again to the opposite side point
      this.context.lineTo(toX, toY);
      this.context.lineTo(toX - arrowLen1, toY - arrowLen2);

      // draws the paths created above
      // this.context.strokeStyle = color;
      this.context.lineWidth = 4;
      this.context.stroke();
      this.context.fillStyle = color;
      this.context.fill();
      this.context.restore();
  }

  isFunction(f: any) {
    return typeof(f) === 'function';
  }

}
