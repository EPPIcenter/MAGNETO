import { Component, ChangeDetectionStrategy, OnInit, ViewChild, Input } from '@angular/core';
import * as d3 from 'd3';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Node } from '../models/network';

@Component({
  selector: 'mgn-selected-node-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #outerHandle fxLayout="column" (window:resize)="onResize($event)">
    <md-card>
      <md-card-title>
        Selected Node
      </md-card-title>
      <md-card-content>
        <div *ngIf="selectedNode">
          <h3>Label: {{selectedNode.label}}</h3>
          <h3><span *ngIf="!selectedNode.isSource">Time: {{selectedNode.time}}</span></h3>
        </div>
        <div #canvasContainerHandle class="container">
          <canvas #canvas></canvas>
        </div>
      </md-card-content>
    </md-card>
    </div>
  `,
  styles: [
    `
      .container {
        margin-left: -24px;
      }
    `
  ]
})
export class SelectedNodePanelComponent implements OnInit {
  @ViewChild('outerHandle') outerHandle;
  @ViewChild('canvasContainerHandle') canvasContainerHandle;
  @ViewChild('canvas') canvasRef;
  get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  get context(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d');
  }

  get outerContainer(): HTMLElement {
    return this.outerHandle.nativeElement;
  }

  get canvasContainer(): HTMLElement {
    return this.canvasContainerHandle.nativeElement;
  }

  @Input() rowBuffer = 2;
  @Input() alleleHeight = 16;
  @Input() alleleWidth = 12;
  @Input() vizMargin = 5;
  @Input() textOffset = 47;
  @Input() leftOffset = 10;
  @Input() rightBuffer = 4;
  @Input() blockBuffer = 2;
  @Input() fontSize = 14;
  @Input() font = 'Helvetica Neue';
  @Input() labelXPadding = 4;
  @Input() labelYPadding = 13;

  private _selectedNode: Node;
  @Input()
  set selectedNode(node: Node) {
    this._selectedNode = node;
    if (this.selectedNode) {
      const maxAlleles = Object.keys(this._selectedNode.alleles).reduce((currMax, locus) => {
        return Math.max(this._selectedNode.alleles[locus].length, currMax);
      }, 0);

      this.alleleWidth = Math.floor(
        ((this.canvas.width - this.textOffset - this.leftOffset - this.rightBuffer) / maxAlleles) -  this.blockBuffer
      );
      this.resizeCanvas();
      this.clearCanvas();
      this.renderLoci();
    }
  }
  get selectedNode() { return this._selectedNode; }

  private _parentNodes: Node[];
  @Input()
  set parentNodes(nodes: Node[]) {
    this._parentNodes = nodes;
    this.clearCanvas();
    this.renderLoci();
  }
  get parentNodes() { return this._parentNodes; }

  ngOnInit() {
    setTimeout(() => {
      this.resizeCanvas();
      // Hack to make rendered allele blocks not fuzzy
      this.context.translate(0.5, 0.5);
      // this.context.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }, 300);
  }

  renderLoci() {
    if (this.selectedNode) {
      this.clearCanvas();
      if (this.selectedNode.isSource) {
        this.renderSourceLoci();
      } else {
        this.renderNodeLoci();
      }
    }
  }

  renderNodeLoci() {
    let yOffset: number;
    let xOffset: number;
    this.context.save();
    this.context.font = this.fontSize + 'px ' + this.font;
    Object.keys(this.selectedNode.alleles).forEach((locus, i) => {
      yOffset = i * (this.alleleHeight + (2 * this.rowBuffer)) + this.vizMargin;
      this.context.fillText(locus, this.labelXPadding, yOffset + this.labelYPadding);
      this.selectedNode.alleles[locus].forEach((allele, j) => {
        xOffset = j * (this.alleleWidth + this.blockBuffer) + this.leftOffset + this.textOffset;
        this.context.save();
        this.context.beginPath();
        this.context.rect(xOffset, yOffset, this.alleleWidth, this.alleleHeight);
        const presentInParent = this.parentNodes.reduce((inAnyParent: boolean, node: Node) => {
            return !!node.alleles[locus][j] || inAnyParent;
        }, false);
        if (allele && presentInParent) {
          this.context.fillStyle = 'blue';
          this.context.fill();
        } else if (allele && !presentInParent) {
          this.context.fillStyle = 'lightblue';
          this.context.fill();
        } else if (!allele && presentInParent) {
          this.context.fillStyle = 'red';
          this.context.fill();
        }
        this.context.stroke();
        this.context.restore();
      });
    });
  }

  renderSourceLoci() {
    let yOffset: number;
    let xOffset: number;
    let maxPrevalence: number;
    this.context.save();
    this.context.font = this.fontSize + 'px ' + this.font;
    Object.keys(this.selectedNode.alleles).forEach((locus, i) => {
      maxPrevalence = Math.max(...this.selectedNode.alleles[locus]);
      yOffset = Math.floor(i * (this.alleleHeight + (2 * this.rowBuffer)) + this.vizMargin);
      this.context.fillText(locus, Math.floor(this.labelXPadding), Math.floor(yOffset + this.labelYPadding));
      this.selectedNode.alleles[locus].forEach((prevalence, j) => {
        xOffset = Math.floor(j * (this.alleleWidth + this.blockBuffer) + this.leftOffset + this.textOffset);
        this.context.save();
        this.context.beginPath();
        this.context.rect(xOffset, yOffset, this.alleleWidth, this.alleleHeight);
        const fillColor = 'rgba(0,0,0,' + prevalence / maxPrevalence + ')';
        this.context.fillStyle = fillColor;
        this.context.fill();
        this.context.stroke();
        this.context.restore();
      });
    });
  }

  onResize(e) {
    this.resizeCanvas();
  }

  resizeCanvas() {
    let canvasBuffer = 0;
    if (this.selectedNode) {
      canvasBuffer = Object.keys(this.selectedNode.alleles).length * (this.alleleHeight + (2 * this.rowBuffer)) + this.vizMargin;
    }
    this.canvas.width = Math.floor(this.outerContainer.offsetWidth);
    this.canvas.height = canvasBuffer;
    this.renderLoci();
  }

  clearCanvas () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

}
