import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from './layout';
import { SidenavComponent } from './sidenav';
import { ToolbarComponent } from './toolbar';
import { ControlButtonComponent } from './control-button';

import { PipesModule } from '../pipes';

export const COMPONENTS = [
  LayoutComponent,
  SidenavComponent,
  ToolbarComponent,
  ControlButtonComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    RouterModule,
    PipesModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS
})

export class ComponentsModule { }
