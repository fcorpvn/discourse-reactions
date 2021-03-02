import { h } from "virtual-dom";
import RawHtml from "discourse/widgets/raw-html";
import { emojiUnescape } from "discourse/lib/text";
import { createWidget } from "discourse/widgets/widget";
import { next } from "@ember/runloop";
import I18n from "I18n";

const DISPLAY_MAX_USERS = 19;

export default createWidget("discourse-reactions-list-emoji", {
  tagName: "div",

  buildId: attrs =>
    `discourse-reactions-list-emoji-${attrs.post.id}-${attrs.reaction.id}`,

  buildKey: attrs =>
    `discourse-reactions-list-emoji-${attrs.post.id}-${attrs.reaction.id}`,

  buildClasses(attrs) {
    const classes = [];
    classes.push(`discourse-reactions-list-emoji-${attrs.reaction.id}`);

    classes.push("reaction");

    classes.push(attrs.reaction.id.toString());

    return classes;
  },

  _setupPopper(postId, reactionId, popper, selector) {
    next(() => {
      let popperElement;
      const trigger = document.querySelector(
        `#discourse-reactions-list-emoji-${postId}-${reactionId}`
      );

      popperElement = document.querySelector(
        `#discourse-reactions-list-emoji-${postId}-${reactionId} ${selector}`
      );

      if (popperElement) {
        popperElement.classList.add("is-expanded");

        if (this[popper]) {
          return;
        }

        this[popper] = this._applyPopper(trigger, popperElement);
      }
    });
  },

  _applyPopper(button, picker) {
    // eslint-disable-next-line
    Popper.createPopper(button, picker, {
      placement: "bottom",
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, -5]
          }
        },
        {
          name: "preventOverflow",
          options: {
            padding: 5
          }
        }
      ]
    });
  },

  html(attrs) {
    if (attrs.reaction.count <= 0) {
      return;
    }

    const reaction = attrs.reaction;
    const users = attrs.reaction.users || [];
    const displayUsers = [];

    displayUsers.push(h("span.heading", attrs.reaction.id));

    users.slice(0, DISPLAY_MAX_USERS).forEach(user => {
      let displayName;
      if (this.siteSettings.prioritize_username_in_ux) {
        displayName = user.username;
      } else if (!user.name) {
        displayName = user.username;
      } else {
        displayName = user.name;
      }

      displayUsers.push(h("span.username", displayName));
    });

    if (attrs.reaction.count > DISPLAY_MAX_USERS) {
      displayUsers.push(
        h(
          "span.other-users",
          I18n.t("discourse_reactions.state_panel.more_users", {
            count: attrs.reaction.count - DISPLAY_MAX_USERS
          })
        )
      );
    }

    this.scheduleRerender();

    this._setupPopper(
      this.attrs.post.id,
      this.attrs.reaction.id,
      "_popperReactionUserPanel",
      `.user-list-${this.attrs.reaction.id}`
    );

    const elements = [
      new RawHtml({
        html: emojiUnescape(`:${reaction.id}:`, { skipTitle: true })
      })
    ];

    if (!this.site.mobileView) {
      elements.push(
        h(
          `div.user-list.user-list-${reaction.id}`,
          h("div.container", displayUsers)
        )
      );
    }

    return elements;
  }
});