import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RouterStoreModule } from '@ngrx/router-store';
// import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { ComponentsModule } from './components';

import { AppComponent } from './containers/app';
import { ControlPanelComponent } from './containers/control-panel';
import { FileLoaderComponent } from './containers/file-loader';
import { TransmissionSummarySettingsComponent } from './containers/transmission-summary-settings';
import { NetworkDisplaySettingsComponent } from './containers/network-display-settings';
import { NetworkPanelComponent } from './containers/network-panel';
import { SelectedNodePanelComponent } from './containers/selected-node-panel';

import { FileService } from './services/files';

import { FileEffects } from './effects/files';
import { ErrorEffects } from './effects/error';

import { reducer } from './reducers';

@NgModule({
  declarations: [
    AppComponent,
    ControlPanelComponent,
    FileLoaderComponent,
    TransmissionSummarySettingsComponent,
    NetworkDisplaySettingsComponent,
    NetworkPanelComponent,
    SelectedNodePanelComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule,
    ComponentsModule,
    StoreModule.provideStore(reducer),
    // StoreDevtoolsModule.instrumentOnlyWithExtension(),
    EffectsModule.run(FileEffects),
    EffectsModule.run(ErrorEffects)
  ],
  providers: [FileService],
  bootstrap: [AppComponent]
})
export class AppModule { }
