import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  JSX,
  Listen,
  Method,
  Prop,
  readTask,
  State,
  Watch
} from '@stencil/core';

import { afterNextRenderTimeout } from '@utils/dom/after-next-render';

import { trackComponent } from '@utils/tracking/usage';

import { GuxTabsAlignment } from './gux-tabs-types';
import { buildI18nForComponent, GetI18nValue } from '../../../i18n';
import tabsResources from './i18n/en.json';

/**
 * @slot tab-list - Slot for gux-tab-list
 * @slot - collection of gux-tab-panel elements
 */

@Component({
  styleUrl: 'gux-tabs.scss',
  tag: 'gux-tabs',
  shadow: true
})
export class GuxTabs {
  private i18n: GetI18nValue;
  @Element()
  root: HTMLElement;

  /**
   * tabId of the currently selected tab
   */
  @Prop({ mutable: true })
  activeTab: string;

  /**
   * Specifies left aligned, centered, or full width tabs
   */
  @Prop()
  alignment: GuxTabsAlignment = 'left';

  @State()
  tabList: HTMLGuxTabListElement;

  @State()
  tabPanels: HTMLGuxTabPanelElement[] = [];

  @State()
  private hasScrollbar: boolean = false;

  @State()
  private isScrolledToBeginning: boolean = false;

  @State()
  private isScrolledToEnd: boolean = false;

  /**
   * Triggers when the active tab changes.
   */
  @Event()
  guxactivetabchange: EventEmitter<string>;

  @Watch('activeTab')
  watchActiveTab(newValue: string) {
    this.activateTab(newValue, this.tabList, this.tabPanels);
    this.guxactivetabchange.emit(newValue);
  }

  @Listen('internalactivatetabpanel')
  onInternalActivateTabPanel(event: CustomEvent): void {
    event.stopPropagation();

    const tabId = event.detail as string;

    this.activateTab(tabId, this.tabList, this.tabPanels);
  }
  private resizeObserver?: ResizeObserver;

  private domObserver?: MutationObserver;
  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxActivate(tabId: string): Promise<void> {
    this.activateTab(tabId, this.tabList, this.tabPanels);
  }

  private onSlotchange(): void {
    const [tabListSlot, defaultSlot] = Array.from(
      this.root.shadowRoot.querySelectorAll('slot')
    );

    this.tabList = tabListSlot.assignedElements()[0] as HTMLGuxTabListElement;
    this.tabPanels = defaultSlot.assignedElements() as HTMLGuxTabPanelElement[];

    this.activateTab(this.activeTab, this.tabList, this.tabPanels);
  }

  private activateTab(
    tabId: string,
    tabList: HTMLGuxTabListElement,
    panels: HTMLGuxTabPanelElement[]
  ): void {
    if (tabId) {
      this.activeTab = tabId;
    } else {
      this.activeTab = panels[0].tabId;
    }

    void tabList.guxSetActive(this.activeTab);
    panels.forEach(
      panel => void panel.guxSetActive(panel.tabId === this.activeTab)
    );
  }

  async componentWillLoad(): Promise<void> {
    trackComponent(this.root);
    this.i18n = await buildI18nForComponent(
      this.root,
      tabsResources,
      'gux-tabs'
    );
  }

  render(): JSX.Element {
    return (
      <Host>
        <div class={`gux-tabs gux-${this.alignment}`}>
          <div class="gux-tab-container">
            {/* if has scrollbar render scroll left */}
            {this.hasScrollbar && this.renderScrollButton('scrollLeft')}
            <slot name="tab-list"></slot>
            {/* if has scrollbar render scroll right */}
            {this.hasScrollbar && this.renderScrollButton('scrollRight')}
          </div>
          <div class={`gux-${this.alignment} gux-panel-container`}>
            <slot onSlotchange={this.onSlotchange.bind(this)}></slot>
          </div>
        </div>
      </Host>
    ) as JSX.Element;
  }

  // scroll
  checkForScrollbarHideOrShow() {
    readTask(() => {
      const el = this.root.querySelector('.gux-scrollable-section');
      const hasScrollbar = el.clientWidth < el.scrollWidth;

      if (hasScrollbar !== this.hasScrollbar) {
        this.hasScrollbar = hasScrollbar;
      }
      this.checkDisabledScrollButtons();
    });
  }
  componentDidLoad() {
    if (!this.resizeObserver && window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() =>
        this.checkForScrollbarHideOrShow()
      );
    }

    if (this.resizeObserver) {
      this.resizeObserver.observe(
        this.root.querySelector('.gux-scrollable-section')
      );
    }

    if (!this.domObserver && window.MutationObserver) {
      this.domObserver = new MutationObserver(() =>
        this.checkForScrollbarHideOrShow()
      );
    }

    if (this.domObserver) {
      this.domObserver.observe(this.root, {
        childList: true,
        attributes: false,
        subtree: true
      });
    }

    afterNextRenderTimeout(() => {
      this.checkForScrollbarHideOrShow();
    }, 500);
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(
        this.root.querySelector('.gux-tab-container')
      );
    }

    if (this.domObserver) {
      this.domObserver.disconnect();
    }
  }

  checkDisabledScrollButtons() {
    const scrollContainer = this.root.querySelector('.gux-scrollable-section');
    if (this.hasScrollbar) {
      const scrollLeft = scrollContainer.scrollLeft;
      const scrollLeftMax =
        scrollContainer.scrollWidth - scrollContainer.clientWidth;
      this.isScrolledToBeginning = scrollLeft === 0;
      this.isScrolledToEnd = scrollLeftMax - scrollLeft === 0;
    } else {
      const scrollTop = scrollContainer.scrollTop;
      const scrollTopMax =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      this.isScrolledToBeginning = scrollTop === 0;
      this.isScrolledToEnd = scrollTopMax - scrollTop === 0;
    }
  }

  private renderScrollButton(direction: string): JSX.Element {
    return (
      <div class="gux-scroll-button-container">
        {this.hasScrollbar ? (
          <button
            disabled={this.getButtonDisabled(direction)}
            tabindex="-1"
            title={this.i18n(direction)}
            aria-label={this.i18n(direction)}
            class="gux-scroll-button"
            onClick={() => this.getScrollDirection(direction)}
          >
            <gux-icon
              icon-name={this.getChevronIconName(direction)}
              decorative={true}
            />
          </button>
        ) : null}
      </div>
    ) as JSX.Element;
  }

  private getScrollDirection(direction: string): void {
    switch (direction) {
      case 'scrollLeft':
        // add method scrollleft to tablist
        // this.scrollLeft();
        break;
      case 'scrollRight':
        // add method scrollright to tablist
        // this.scrollRight();
        break;
    }
  }

  private getButtonDisabled(direction: string): boolean {
    switch (direction) {
      case 'scrollLeft':
        return this.isScrolledToBeginning;

      case 'scrollRight':
        return this.isScrolledToEnd;
    }
  }

  private getChevronIconName(direction: string): string {
    switch (direction) {
      case 'scrollLeft':
        return 'chevron-small-left';
      case 'scrollRight':
        return 'chevron-small-right';
    }
  }
}
