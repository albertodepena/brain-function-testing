import { html } from 'lit-html';

const view = () => {
  return html`
    <div class="view confirmation">
      <p>Before starting your test, read the instructions below:</p>
      <ul>
        <li>
          <p>
            <span>Follow the instructions and examples.</span> Each test has a set of instructions and some tests have
            practice tests. Read these instructions carefully and perform these practice tests to ensure accurate results.
          </p>
        </li>
        <li>
          <p>
            <span>Turn off all distractions.</span> Put your phone on silent or ‘Do Not Disturb’ mode. Close your email
            application. This test is timed, so any distractions will affect your results.
          </p>
        </li>
        <li>
          <p>
            <span>Do not close or refresh this test window for any reason.</span> Once you click ‘Begin assessment,’ you
            must complete the test or you will have to start again. If you click ‘Back’ or ‘Refresh,’ your test will no
            longer be accessible and your results will be lost.
          </p>
        </li>
      </ul>
      <p>Confirm:</p>
      <div class="confirm">
        <div>
          <input id="instructionsRead" type="checkbox" />
          <label for="instructionsRead">I have read the above instructions</label>
        </div>
        <div>
          <input id="usingComputer" type="checkbox" />
          <label for="usingComputer">I am using a desktop or laptop computer</label>
        </div>
      </div>
    </div>
  `;
};

const confirm = { view };

export default confirm;
