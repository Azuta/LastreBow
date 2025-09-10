// src/components/editor/Spoiler.ts
import { Mark, mergeAttributes } from '@tiptap/core';

export interface SpoilerOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spoiler: {
      /**
       * Activa o desactiva la marca de spoiler.
       */
      toggleSpoiler: () => ReturnType;
    };
  }
}

export const Spoiler = Mark.create<SpoilerOptions>({
  name: 'spoiler',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-spoiler]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-spoiler': 'true' }), 0];
  },

  addCommands() {
    return {
      toggleSpoiler: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
    };
  },
});