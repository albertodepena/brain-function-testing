import * as Bluebird from 'bluebird';
import { PLATFORM } from 'aurelia-framework';

Bluebird.config({ warnings: false, longStackTraces: false });

export async function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .feature(PLATFORM.moduleName('custom-elements/index'));

  await aurelia.start();
  await aurelia.setRoot(PLATFORM.moduleName('app'));
}
