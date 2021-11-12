import { E2EPage } from '@stencil/core/testing';
import { newSparkE2EPage, a11yCheck } from '../../../../../tests/e2eTestUtils';

const axeExclusions = [];

async function clickDismissButton(page: E2EPage) {
  await page.evaluate(async () => {
    const element = document.querySelector('gux-simple-toast');
    const dismissButtonElement =
      element.shadowRoot.querySelector('gux-dismiss-button');
    const button = dismissButtonElement.shadowRoot.querySelector('button');

    button.click();
  });
}

describe('gux-simple-toast', () => {
  describe('#render', () => {
    [
      {
        description: 'should render neutral simple toast',
        html: `
          <gux-simple-toast lang="en" accent="neutral">
            <gux-icon slot="icon" icon-name="user-add" decorative></gux-icon>
            <div slot="message">This is the message</div>
          </gux-simple-toast>
        `
      },
      {
        description: 'should render positive simple toast',
        html: `
          <gux-simple-toast lang="en" accent="positive">
            <gux-icon slot="icon" icon-name="user-add" decorative></gux-icon>
            <div slot="message">This is the message</div>
          </gux-simple-toast>
        `
      },
      {
        description: 'should render alert simple toast',
        html: `
          <gux-simple-toast lang="en" accent="alert">
            <gux-icon slot="icon" icon-name="user-add" decorative></gux-icon>
            <div slot="message">This is the message</div>
          </gux-simple-toast>
        `
      },
      {
        description: 'should render warning simple toast',
        html: `
          <gux-simple-toast lang="en" accent="warning">
            <gux-icon slot="icon" icon-name="user-add" decorative></gux-icon>
            <div slot="message">This is the message</div>
          </gux-simple-toast>
        `
      }
    ].forEach(({ description, html }) => {
      it(description, async () => {
        const page = await newSparkE2EPage({ html });
        const element = await page.find('gux-simple-toast');
        await a11yCheck(page, axeExclusions);

        expect(element.outerHTML).toMatchSnapshot();
      });
    });
  });

  describe('dismiss', () => {
    it('click dismiss button', async () => {
      const html = `
        <gux-simple-toast lang="en" accent="neutral">
          <gux-icon slot="icon" icon-name="user-add" decorative></gux-icon>
          <div slot="message">This is the message</div>
        </gux-simple-toast>
      `;
      const page = await newSparkE2EPage({ html });
      const element = await page.find('gux-simple-toast');
      const guxdismissSpy = await page.spyOnEvent('guxdismiss');
      const clickSpy = await page.spyOnEvent('click');

      expect(guxdismissSpy).not.toHaveReceivedEvent();
      expect(clickSpy).not.toHaveReceivedEvent();
      expect(await page.find('gux-simple-toast')).not.toBeNull();

      await clickDismissButton(page);
      await page.waitForChanges();

      expect(guxdismissSpy).toHaveReceivedEvent();
      expect(clickSpy).not.toHaveReceivedEvent();
      expect(await page.find('gux-simple-toast')).toBeNull();
    });

    it('click dismiss button and prevent default', async () => {
      const html = `
        <gux-simple-toast lang="en" accent="neutral">
          <gux-icon slot="icon" icon-name="user-add" decorative></gux-icon>
          <div slot="message">This is the message</div>
        </gux-simple-toast>
      `;
      const page = await newSparkE2EPage({ html });
      const element = await page.find('gux-simple-toast');
      const guxdismissSpy = await page.spyOnEvent('guxdismiss');
      const clickSpy = await page.spyOnEvent('click');

      await page.evaluate(() => {
        document.addEventListener('guxdismiss', event => {
          event.preventDefault();
        });
      });

      expect(guxdismissSpy).not.toHaveReceivedEvent();
      expect(clickSpy).not.toHaveReceivedEvent();
      expect(await page.find('gux-simple-toast')).not.toBeNull();

      await clickDismissButton(page);
      await page.waitForChanges();

      expect(guxdismissSpy).toHaveReceivedEvent();
      expect(clickSpy).not.toHaveReceivedEvent();
      expect(await page.find('gux-simple-toast')).not.toBeNull();
    });
  });
});
