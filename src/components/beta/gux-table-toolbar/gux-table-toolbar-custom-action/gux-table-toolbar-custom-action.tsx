import { Component, Element, JSX, h, Prop } from '@stencil/core';
import { trackComponent } from '../../../../usage-tracking';
import { GuxTableToolbarActionAccent } from '../gux-table-toolbar-action-accents.types';

/**
 * @slot text - Slot for action text.
 * @slot icon - Slot for icon.
 */

@Component({
  styleUrl: 'gux-table-toolbar-custom-action.less',
  tag: 'gux-table-toolbar-custom-action',
  shadow: true
})
export class GuxTableToolbarCustomAction {
  @Element()
  root: HTMLElement;

  @Prop()
  iconOnly: boolean = false;

  @Prop()
  accent: GuxTableToolbarActionAccent = 'secondary';

  componentWillLoad() {
    trackComponent(this.root);
  }

  render(): JSX.Element {
    return (
      <gux-button-slot-beta accent={this.accent}>
        <button type="button" class="gux-action-title">
          <slot name="icon" />
          <span class={{ 'gux-sr-only': this.iconOnly }}>
            <slot name="text" />
          </span>
        </button>
      </gux-button-slot-beta>
    ) as JSX.Element;
  }
}