import { iconNode } from "discourse-common/lib/icon-library";
import { h } from "virtual-dom";
import { createWidget } from "discourse/widgets/widget";
import { later, cancel } from "@ember/runloop";

export default createWidget("discourse-reactions-reaction-button", {
  tagName: "div.discourse-reactions-reaction-button",

  buildKey: attrs => `discourse-reactions-reaction-button-${attrs.post.id}`,

  click() {
    if (!this.site.mobileView) {
      this.callWidgetFunction("toggleLike");
    }
  },

  touchStart() {
    this._touchTimeout && cancel(this._touchTimeout);

    if (this.site.mobileView) {
      const root = document.getElementsByTagName("html")[0];
      root && root.classList.add("no-select");

      this._touchStartAt = Date.now();
      this._touchTimeout = later(() => {
        this._touchStartAt = null;
        this.callWidgetFunction("toggleReactions");
      }, 400);
      return false;
    }
  },

  touchEnd(event) {
    this._touchTimeout && cancel(this._touchTimeout);

    const root = document.getElementsByTagName("html")[0];
    root && root.classList.remove("no-select");

    if (this.site.mobileView && this._touchStartAt) {
      const duration = Date.now() - (this._touchStartAt || 0);
      this._touchStartAt = null;
      if (duration > 400) {
        this.callWidgetFunction("toggleReactions", event);
      } else {
        this.callWidgetFunction("toggleLike");
      }
    }
  },

  mouseOver(event) {
    if (!this.site.mobileView) {
      this.callWidgetFunction("toggleReactions", event);
    }
  },

  mouseOut(event) {
    if (!this.site.mobileView) {
      this.callWidgetFunction("collapseReactionsPicker", event);
    }
  },

  html(attrs) {
    const likeIcon = this.siteSettings.discourse_reactions_like_icon;
    const hasLike = attrs.post.likeAction.acted;
    const icon = hasLike ? likeIcon : `far-${likeIcon}`;

    return h(
      `button.btn-toggle-reaction.btn-icon.no-text${
        hasLike ? ".has-like" : ""
      }`,
      [iconNode(icon)]
    );
  }
});
