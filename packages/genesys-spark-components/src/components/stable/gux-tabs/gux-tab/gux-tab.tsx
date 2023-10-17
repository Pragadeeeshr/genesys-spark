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
  State
} from '@stencil/core';

/**
 * @slot - text
 */

@Component({
  styleUrl: 'gux-tab.scss',
  tag: 'gux-tab',
  shadow: true
})
export class GuxTab {
  private tooltipTitleElement: HTMLGuxTooltipTitleElement;

  @Element()
  root: HTMLElement;

  /**
   * Tab id for the tab
   */
  @Prop()
  tabId: string;

  /**
   * Specifies if tab is disabled
   */
  @Prop()
  guxDisabled: boolean = false;

  @State()
  active: boolean = false;

  @Listen('click')
  onClick() {
    if (!this.active && !this.guxDisabled) {
      this.internalactivatetabpanel.emit(this.tabId);
    }
  }

  @Listen('focusin')
  onFocusin() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    void this.tooltipTitleElement.setShowTooltip();
  }

  @Listen('focusout')
  onFocusout() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    void this.tooltipTitleElement.setHideTooltip();
  }

  @Event()
  internalactivatetabpanel: EventEmitter<string>;

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxSetActive(active: boolean): Promise<void> {
    this.active = active;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxFocus(): Promise<void> {
    this.root.focus();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxGetActive() {
    return this.active;
  }

  render(): JSX.Element {
    return (
      <Host
        class={{
          'gux-disabled': this.guxDisabled,
          'gux-tab': true,
          'gux-active': this.active
        }}
        type="button"
        aria-disabled={this.guxDisabled.toString()}
        id={`gux-${this.tabId}-tab`}
        role="tab"
        aria-controls={`gux-${this.tabId}-panel`}
        aria-selected={this.active.toString()}
        tabIndex={this.active ? 0 : -1}
      >
        <gux-tooltip-title ref={el => (this.tooltipTitleElement = el)}>
          <span>
            <slot />
          </span>
        </gux-tooltip-title>
      </Host>
    ) as JSX.Element;
  }
}
