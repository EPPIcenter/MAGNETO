import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mgn-control-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button md-button disabled={{isDisabled}} (click)="clicked.emit()" color={{color}} >
    <span *ngIf="!busy">{{title}}</span>
    <span *ngIf="busy">{{busyTitle}}</span>
    </button>
  `,
  styles: [`
    button {
      width: 100%;
    }
  `]
})
export class ControlButtonComponent {
  @Input() title: string;
  @Input() busyTitle: string;
  @Input() busy: boolean;
  @Input() disabledConditions: boolean[] = [];
  @Input() color = 'primary';
  @Output() clicked = new EventEmitter();

  get isDisabled() {
    return this.busy || this.disabledConditions.some(condition => condition);
  };

}
