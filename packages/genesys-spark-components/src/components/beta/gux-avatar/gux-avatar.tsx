import { Component, h, JSX, Prop, Element, Fragment } from '@stencil/core';
import { trackComponent } from '@utils/tracking/usage';
import {
  GuxAvatarStatus,
  GuxAvatarSize,
  GuxAvatarAccent
} from './gux-avatar.types';
import { hasSlot } from '@utils/dom/has-slot';

/**
 * @slot image - Headshot photo.
 */

@Component({
  styleUrl: 'gux-avatar.scss',
  tag: 'gux-avatar-beta',
  shadow: true
})
export class GuxAvatar {
  /*
   * Reference to the host element.
   */
  @Element()
  root: HTMLElement;

  @Prop()
  status: GuxAvatarStatus = 'available';

  @Prop()
  size: GuxAvatarSize = 'large';

  @Prop()
  statusRing: boolean = false;

  @Prop()
  initials: string;

  @Prop()
  accent: GuxAvatarAccent = 'default';

  @Prop()
  interactive: boolean = false;

  hasImageSlot: boolean;

  componentWillLoad(): void {
    trackComponent(this.root, { variant: this.status });
    this.hasImageSlot = hasSlot(this.root, 'image');
  }

  render(): JSX.Element {
    const avatarContent = (
      <Fragment>
        <div
          class={{
            'gux-avatar': true,
            [`gux-${this.status}`]: true,
            [`gux-${this.size}`]: true,
            [`gux-${this.statusRing && 'status-ring'}`]: true
          }}
        >
          <div
            class={{
              content: true,
              [`gux-accent-${this.accent}`]: true
            }}
          >
            {this.hasImageSlot ? (
              <slot name="image"></slot>
            ) : (
              <div class="initials">{this.initials}</div>
            )}
          </div>
        </div>
      </Fragment>
    );

    return this.interactive
      ? ((<button>{avatarContent}</button>) as JSX.Element)
      : (avatarContent as JSX.Element);
  }
}
