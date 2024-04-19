import { Component, JSX, h, Element, State, forceUpdate } from '@stencil/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
// import { Level as HeadingLevel } from '@tiptap/extension-heading';

@Component({
  styleUrl: 'gux-rich-text-editor.scss',
  tag: 'gux-rich-text-editor-beta',
  shadow: true
})
export class GuxScreenReader {
  @Element()
  root: HTMLElement;

  wrapper: HTMLElement;
  dropdown: HTMLElement;
  editor: Editor;

  @State()
  test: boolean = false;

  private menu() {
    return (
      <div class="menu">
        <gux-button
          accent={this.editor?.isActive('bold') ? 'primary' : 'tertiary'}
          onClick={() => this.editor?.chain().focus().toggleBold().run()}
          class={{ 'has-active': this.editor?.isActive('bold') }}
        >
          <gux-icon icon-name="fa/bold-regular" decorative={true}></gux-icon>
        </gux-button>

        <gux-button
          accent={this.editor?.isActive('strike') ? 'primary' : 'tertiary'}
          onClick={() => this.editor?.chain().focus().toggleStrike().run()}
        >
          <gux-icon
            icon-name="fa/strikethrough-regular"
            decorative={true}
          ></gux-icon>
        </gux-button>
        <gux-button
          accent={this.editor?.isActive('bulletList') ? 'primary' : 'tertiary'}
          onClick={() => this.editor?.chain().focus().toggleBulletList().run()}
        >
          <gux-icon icon-name="fa/list-ul-regular" decorative={true}></gux-icon>
        </gux-button>
        <gux-button
          accent={this.editor?.isActive('orderedList') ? 'primary' : 'tertiary'}
          onClick={() => this.editor?.chain().focus().toggleOrderedList().run()}
        >
          <gux-icon icon-name="fa/list-ol-regular" decorative={true}></gux-icon>
        </gux-button>

        <gux-button
          accent={this.editor?.isActive('code') ? 'primary' : 'tertiary'}
          onClick={() => this.editor?.chain().focus().toggleCode().run()}
        >
          <gux-icon icon-name="fa/code-regular" decorative={true}></gux-icon>
        </gux-button>

        <gux-button
          accent={this.editor?.isActive('codeBlock') ? 'primary' : 'tertiary'}
          onClick={() => this.editor?.chain().focus().toggleCodeBlock().run()}
        >
          <gux-icon icon-name="fa/code-regular" decorative={true}></gux-icon>
        </gux-button>

        <gux-dropdown placeholder="Normal text">
          <gux-listbox>
            <gux-option
              value="normal"
              onClick={() => this.editor?.chain().focus().setParagraph().run()}
            >
              Normal text
            </gux-option>
          </gux-listbox>
        </gux-dropdown>
      </div>
    ) as JSX.Element;
  }

  private setupEditor(): void {
    this.editor = new Editor({
      element: this.wrapper,
      extensions: [
        CodeBlock,
        StarterKit.configure({
          bulletList: {
            HTMLAttributes: {
              class: 'bullet-list'
            }
          },
          heading: {
            levels: [1, 2, 3, 4, 5, 6]
          }
        })
      ],
      content: '<p>Hello <strong>World!</strong></p>',
      onTransaction: () => {
        forceUpdate(this.root);
      }
    });
  }

  componentDidLoad() {
    this.setupEditor();
  }

  render() {
    return (
      <div>
        {this.menu()}
        <div
          class="wrapper"
          ref={el => (this.wrapper = el as HTMLElement)}
        ></div>
        <gux-cta-group>
          <gux-button
            slot="secondary"
            onClick={() => console.log(this.editor.getHTML())}
          >
            Get HTML
          </gux-button>
          <gux-button
            slot="secondary"
            onClick={() => console.log(this.editor.getJSON())}
          >
            Get JSON
          </gux-button>
          <gux-button
            slot="secondary"
            onClick={() => console.log(this.editor.getText())}
          >
            Get Text
          </gux-button>
        </gux-cta-group>
      </div>
    ) as JSX.Element;
  }
}
