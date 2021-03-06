import { HttpClient } from 'aurelia-http-client';
import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(HttpClient, EventAggregator)
export class Api {

  constructor(httpClient, eventAggregator) {
    const that = this;
    that.eventAggregator = eventAggregator;
    that.httpClient = httpClient.configure(opts => {
      opts.withInterceptor({
        request(message) {
          that.eventAggregator.publish('loading-event', true);
          return message;
        },
        requestError(error) {
          that.eventAggregator.publish('loading-event', false);
          throw error;
        },
        response(message) {
          that.eventAggregator.publish('loading-event', false);
          return message;
        },
        responseError(error) {
          that.eventAggregator.publish('loading-event', false);
          throw error;
        }
      });
    });
  }

  /**
    * 
    * @param {String} email
    * @param {String} testConfig
    * @returns {TestLinkResult} test link result
    */
  getTestLink(email, testConfig) {
    return this.httpClient.get(`${GET_TEST_LINK_URL}&email=${email}&config=${testConfig}`)
      .then(result => JSON.parse(result.response));
  }

  /**
   * 
   * @param {String} email 
   * @returns {Tester} tester
   */
  getTester(email) {
    return this.httpClient.get(`${GET_TESTER_URL}&email=${email}`)
      .then(result => JSON.parse(result.response))
      .then(tester => {
        const [dobMonth, dobDay, dobYear] = tester.dob.split('/');
        return { ...tester, dobMonth, dobDay, dobYear };
      });
  }

  /**
   * 
   * @param {Tester} tester 
   * @returns {String} tester ID
   */
  saveTester(tester) {
    const { dobMonth, dobDay, dobYear } = tester;
    tester.dob = `${dobMonth}/${dobDay}/${dobYear}`;
    return this.httpClient.post(`${SAVE_TESTER_URL}`, tester)
      .then(result => result.response);
  }
}
