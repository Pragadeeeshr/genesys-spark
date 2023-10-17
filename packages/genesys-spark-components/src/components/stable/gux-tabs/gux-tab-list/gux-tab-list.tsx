import {
  Component,
  Element,
  h,
  Host,
  JSX,
  Listen,
  Method,
  State,
  writeTask
} from '@stencil/core';

import { buildI18nForComponent, GetI18nValue } from '../../../../i18n';
import { OnMutation } from '@utils/decorator/on-mutation';

import tabsResources from '../i18n/en.json';

@Component({
  styleUrl: 'gux-tab-list.scss',
  tag: 'gux-tab-list',
  shadow: true
})
export class GuxTabList {
  private i18n: GetI18nValue;
  private triggerIds: string;
  private currentScrollIndex: number = 0;

  @Element()
  root: HTMLElement;

  @State()
  focused: number = 0;

  @State()
  tabTriggers: NodeListOf<HTMLGuxTabElement>;

  @State()
  private hasScrollbar: boolean = false;

  @State()
  private isScrolledToBeginning: boolean = false;

  @State()
  private isScrolledToEnd: boolean = false;

  @Listen('focusout')
  onFocusout(event: FocusEvent) {
    if (!this.root.contains(event.relatedTarget as Node)) {
      this.tabTriggers.forEach((tabTrigger, index) => {
        void tabTrigger.guxGetActive().then(activeElement => {
          if (activeElement) {
            this.focused = index;
          } else {
            tabTrigger.setAttribute('tabindex', '-1');
          }
        });
      });
    }
  }

  // @Listen('scroll', { capture: true })
  // onScroll(): void {
  //   this.checkDisabledScrollButtons();
  // }

  private resizeObserver?: ResizeObserver;

  private domObserver?: MutationObserver;

  @Listen('keydown')
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.handleKeyboardScroll('forward');
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.handleKeyboardScroll('backward');
        break;
      case 'Escape':
        event.preventDefault();
        this.focusTab(this.focused);
        break;
      case 'Home':
        event.preventDefault();
        this.focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusTab(this.tabTriggers.length - 1);
        break;
    }
  }

  @OnMutation({ childList: true, subtree: true })
  onMutation(): void {
    this.setTabTriggers();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxSetActive(activeTab: string): Promise<void> {
    this.tabTriggers.forEach((tabTrigger, index) => {
      const active = tabTrigger.tabId === activeTab;

      void tabTrigger.guxSetActive(active);

      if (active) {
        this.focused = index;
      }
    });
  }

  private focusTab(tabIndex: number): void {
    this.focused = tabIndex;
    this.tabTriggers.forEach((tabTrigger, index) => {
      void tabTrigger.guxGetActive().then(activeElement => {
        console.log(tabTrigger);
        if (this.focused !== index && !activeElement) {
          tabTrigger.setAttribute('tabindex', '-1');
        }
      });
    });
    this.tabTriggers[this.focused].setAttribute('tabindex', '0');
    void this.tabTriggers[this.focused].guxFocus();
  }

  private setTabTriggers(): void {
    this.tabTriggers = this.root.querySelectorAll('gux-tab');
    if (this.tabTriggers) {
      this.triggerIds = Array.from(this.tabTriggers)
        .map(trigger => `gux-${trigger.getAttribute('tab-id')}-tab`)
        .join(' ');
    } else {
      this.triggerIds = '';
    }
  }

  // checkForScrollbarHideOrShow() {
  //   readTask(() => {
  //     const el = this.root.querySelector('.gux-scrollable-section');
  //     const hasScrollbar = el.clientWidth < el.scrollWidth;

  //     if (hasScrollbar !== this.hasScrollbar) {
  //       this.hasScrollbar = hasScrollbar;
  //     }
  //     this.checkDisabledScrollButtons();
  //   });
  // }

  handleKeyboardScroll(direction: 'forward' | 'backward'): void {
    const scrollableSection = this.root.querySelector(
      '.gux-scrollable-section'
    );

    if (direction === 'forward') {
      if (this.focused < this.tabTriggers.length - 1) {
        writeTask(() => {
          this.scrollRight();
        });
        this.focusTab(this.focused + 1);
      } else {
        writeTask(() => {
          this.hasScrollbar &&
            scrollableSection.scrollBy(-scrollableSection.scrollWidth, 0);
        });
        this.focusTab(0);
      }
    } else if (direction === 'backward') {
      if (this.focused > 0) {
        writeTask(() => {
          this.scrollLeft();
        });
        this.focusTab(this.focused - 1);
      } else {
        writeTask(() => {
          this.hasScrollbar &&
            scrollableSection.scrollBy(scrollableSection.scrollWidth, 0);
        });
        this.focusTab(this.tabTriggers.length - 1);
      }
    }
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

  async componentWillLoad(): Promise<void> {
    this.setTabTriggers();
    this.i18n = await buildI18nForComponent(
      this.root,
      tabsResources,
      'gux-tabs'
    );
  }

  componentDidLoad() {
    // if (!this.resizeObserver && window.ResizeObserver) {
    //   this.resizeObserver = new ResizeObserver(() =>
    //     this.checkForScrollbarHideOrShow()
    //   );
    // }

    if (this.resizeObserver) {
      this.resizeObserver.observe(
        this.root.querySelector('.gux-scrollable-section')
      );
    }

    // if (!this.domObserver && window.MutationObserver) {
    //   this.domObserver = new MutationObserver(() =>
    //     this.checkForScrollbarHideOrShow()
    //   );
    // }

    if (this.domObserver) {
      this.domObserver.observe(this.root, {
        childList: true,
        attributes: false,
        subtree: true
      });
    }

    // afterNextRenderTimeout(() => {
    //   this.checkForScrollbarHideOrShow();
    // }, 500);
  }

  // checkDisabledScrollButtons() {
  //   const scrollContainer = this.root.querySelector('.gux-scrollable-section');
  //   if (this.hasScrollbar) {
  //     const scrollLeft = scrollContainer.scrollLeft;
  //     const scrollLeftMax =
  //       scrollContainer.scrollWidth - scrollContainer.clientWidth;
  //     this.isScrolledToBeginning = scrollLeft === 0;
  //     this.isScrolledToEnd = scrollLeftMax - scrollLeft === 0;
  //   } else {
  //     const scrollTop = scrollContainer.scrollTop;
  //     const scrollTopMax =
  //       scrollContainer.scrollHeight - scrollContainer.clientHeight;
  //     this.isScrolledToBeginning = scrollTop === 0;
  //     this.isScrolledToEnd = scrollTopMax - scrollTop === 0;
  //   }
  // }

  getTabLength(): number {
    return this.tabTriggers[this.currentScrollIndex]?.scrollWidth;
  }

  scrollLeft() {
    writeTask(() => {
      if (this.isScrolledToEnd) {
        this.currentScrollIndex = this.tabTriggers.length - 1;
      } else {
        this.currentScrollIndex = this.currentScrollIndex - 1;
      }
      this.root
        .querySelector('.gux-scrollable-section')
        .scrollBy(-this.getTabLength(), 0);
    });
  }

  scrollRight() {
    writeTask(() => {
      if (this.isScrolledToBeginning) {
        this.currentScrollIndex = 0;
      }
      this.root
        .querySelector('.gux-scrollable-section')
        .scrollBy(this.getTabLength(), 0);
      this.currentScrollIndex = this.currentScrollIndex + 1;
    });
  }

  render(): JSX.Element {
    return (
      <Host
        role="tablist"
        class="gux-scrollable-section"
        aria-owns={this.triggerIds}
      >
        <slot></slot>
      </Host>
    ) as JSX.Element;
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

  private getButtonDisabled(direction: string): boolean {
    switch (direction) {
      case 'scrollLeft':
        return this.isScrolledToBeginning;

      case 'scrollRight':
        return this.isScrolledToEnd;
    }
  }

  private getScrollDirection(direction: string): void {
    switch (direction) {
      case 'scrollLeft':
        this.scrollLeft();
        break;
      case 'scrollRight':
        this.scrollRight();
        break;
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
