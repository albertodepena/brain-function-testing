import 'skeleton-framework/dist/skeleton.css';

import flyd from 'flyd';
import { render } from 'lit-html';
import { P } from 'patchinko/explicit';

import app from './app';
import { configureRouter } from './core/router';

const update = flyd.stream();
const actions = app.actions(update);
const element = document.getElementById('bft-app');

configureRouter(routeParams => actions.updateRoute(routeParams));

flyd
  .scan(P, app.initialState(), update)
  .map(state => render(app.view(state, actions), element));