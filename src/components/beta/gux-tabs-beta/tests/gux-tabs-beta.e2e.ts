import { E2EElement, E2EPage, newE2EPage } from '@stencil/core/testing';

async function newNonrandomE2EPage(
  {
    html
  }: {
    html: string;
  },
  lang: string = 'en'
): Promise<E2EPage> {
  const page = await newE2EPage();

  await page.evaluateOnNewDocument(() => {
    Math.random = () => 0.5;
  });
  await page.setContent(`<div lang=${lang}>${html}</div>`);
  await page.waitForChanges();
  await page.addScriptTag({
    path: 'node_modules/axe-core/axe.min.js'
  });
  await page.waitForChanges();
  return page;
}

describe('gux-tabs-beta', () => {
  const html = `
    <gux-tabs-beta>
      <gux-tab-list-beta slot="tab-list">
          <gux-tab-beta tab-id="2-1"><span>Tab Header 1</span></gux-tab-beta>
          <gux-tab-beta tab-id="2-2"><span>Tab Header 2</span></gux-tab-beta>
          <gux-tab-beta tab-id="2-3"><span>Tab Header 3</span></gux-tab-beta>
          <gux-tab-beta gux-disabled tab-id="2-4"
            ><span>Tab Header 4</span></gux-tab-beta
          >
          <gux-tab-beta gux-disabled tab-id="2-5"
            ><span>Tab Header 5</span></gux-tab-beta
          >
      </gux-tab-list-beta>
      <gux-tab-panel-beta tab-id="2-1">Tab content 1</gux-tab-panel-beta>
      <gux-tab-panel-beta tab-id="2-2">Tab content 2</gux-tab-panel-beta>
      <gux-tab-panel-beta tab-id="2-3">Tab content 3</gux-tab-panel-beta>
      <gux-tab-panel-beta tab-id="2-4">Tab content 4</gux-tab-panel-beta>
      <gux-tab-panel-beta tab-id="2-5">Tab content 5</gux-tab-panel-beta>
    </gux-tabs-beta>
`;
  describe('#render', () => {
    it('renders', async () => {
      const page = await newNonrandomE2EPage({ html });
      const element = await page.find('gux-tabs-beta');

      expect(element.outerHTML).toMatchSnapshot();
    });

    it('renders with translation strings', async () => {
      const restrictedWidthHtml = `<div style="width: 500px">${html}</div>`;
      const page = await newNonrandomE2EPage(
        { html: restrictedWidthHtml },
        'ja'
      );
      const element = await page.find('gux-tabs-beta');

      expect(element.outerHTML).toMatchSnapshot();
    });

    it('does not render the scroll buttons when tabs fit container', async () => {
      const page = await newNonrandomE2EPage({ html });
      const scrollButtons = await page.findAll('.gux-scroll-button');
      expect(scrollButtons.length).toBe(0);
    });

    it('renders scroll buttons when tabs overflow container', async () => {
      const restrictedWidthHtml = `<div style="width: 500px">${html}</div>`;
      const page = await newNonrandomE2EPage({ html: restrictedWidthHtml });
      const scrollButtons = await page.findAll('.gux-scroll-button');
      expect(scrollButtons.length).toBe(2);
    });
  });

  describe('#interactions', () => {
    it('should change tabpanel content when tab is changed', async () => {
      const page = await newNonrandomE2EPage({ html });
      const tabTarget = await page.find('gux-tab-beta[tab-id="2-2"]');
      const tabPanel = await page.find('gux-tab-panel-beta[tab-id="2-2"]');
      const spyOnActivePanelChangeEvent = await tabPanel.spyOnEvent(
        'guxactivepanelchange'
      );

      tabTarget.click();
      await page.waitForChanges();

      expect(spyOnActivePanelChangeEvent.length).toBe(1);
      expect(spyOnActivePanelChangeEvent.events[0].detail).toBe('2-2');
    });
    it('should not change tabpanel content when tab is disabled', async () => {
      const page = await newNonrandomE2EPage({ html });
      const tabTarget = await page.find('gux-tab-beta[tab-id="2-4"]');
      const tabPanel = await page.find('gux-tab-panel-beta[tab-id="2-4"]');
      const spyOnActivePanelChangeEvent = await tabPanel.spyOnEvent(
        'guxactivepanelchange'
      );

      tabTarget.click();
      await page.waitForChanges();

      expect(spyOnActivePanelChangeEvent.length).toBe(0);
    });
  });
});