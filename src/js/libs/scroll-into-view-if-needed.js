/*
This code is stiched together from the scroll-into-view-if-needed and the
compute-scroll-into-view libraries (the latter needed by the former), and
modified to work on Gecko 48.
https://github.com/scroll-into-view/compute-scroll-into-view
https://github.com/scroll-into-view/scroll-into-view-if-needed

The MIT License applies to these two libraries.

MIT License

Copyright (c) 2023 Cody Olsen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

(() => {
  const compute = (window.computeScrollIntoView = (() => {
    const isElement = (el) =>
      typeof el === "object" && el != null && el.nodeType === 1;
    const canOverflow = (overflow, skipOverflowHiddenElements) => {
      if (skipOverflowHiddenElements && overflow === "hidden") {
        return false;
      }
      return overflow !== "visible" && overflow !== "clip";
    };
    const getFrameElement = (el) => {
      if (!el.ownerDocument || !el.ownerDocument.defaultView) {
        return null;
      }
      try {
        return el.ownerDocument.defaultView.frameElement;
      } catch (e) {
        return null;
      }
    };
    const isHiddenByFrame = (el) => {
      const frame = getFrameElement(el);
      if (!frame) {
        return false;
      }
      return (
        frame.clientHeight < el.scrollHeight ||
        frame.clientWidth < el.scrollWidth
      );
    };
    const isScrollable = (el, skipOverflowHiddenElements) => {
      if (
        el.clientHeight < el.scrollHeight ||
        el.clientWidth < el.scrollWidth
      ) {
        const style = getComputedStyle(el, null);
        return (
          canOverflow(style.overflowY, skipOverflowHiddenElements) ||
          canOverflow(style.overflowX, skipOverflowHiddenElements) ||
          isHiddenByFrame(el)
        );
      }
      return false;
    };
    const alignNearest = (
      scrollingEdgeStart,
      scrollingEdgeEnd,
      scrollingSize,
      scrollingBorderStart,
      scrollingBorderEnd,
      elementEdgeStart,
      elementEdgeEnd,
      elementSize
    ) => {
      if (
        (elementEdgeStart < scrollingEdgeStart &&
          elementEdgeEnd > scrollingEdgeEnd) ||
        (elementEdgeStart > scrollingEdgeStart &&
          elementEdgeEnd < scrollingEdgeEnd)
      ) {
        return 0;
      }
      if (
        (elementEdgeStart <= scrollingEdgeStart &&
          elementSize <= scrollingSize) ||
        (elementEdgeEnd >= scrollingEdgeEnd && elementSize >= scrollingSize)
      ) {
        return elementEdgeStart - scrollingEdgeStart - scrollingBorderStart;
      }
      if (
        (elementEdgeEnd > scrollingEdgeEnd && elementSize < scrollingSize) ||
        (elementEdgeStart < scrollingEdgeStart && elementSize > scrollingSize)
      ) {
        return elementEdgeEnd - scrollingEdgeEnd + scrollingBorderEnd;
      }
      return 0;
    };
    const getParentElement = (element) => {
      const parent = element.parentElement;
      if (parent == null) {
        return (element.getRootNode && element.getRootNode().host) || null;
      }
      return parent;
    };
    const compute = (target, options) => {
      var _a, _b, _c, _d;
      if (typeof document === "undefined") {
        return [];
      }
      const {
        scrollMode,
        block,
        inline,
        boundary,
        skipOverflowHiddenElements,
      } = options;
      const checkBoundary =
        typeof boundary === "function" ? boundary : (node) => node !== boundary;
      if (!isElement(target)) {
        throw new TypeError("Invalid target");
      }
      const scrollingElement =
        document.scrollingElement || document.documentElement;
      const frames = [];
      var cursor = target;
      while (isElement(cursor) && checkBoundary(cursor)) {
        cursor = getParentElement(cursor);
        if (cursor === scrollingElement) {
          frames.push(cursor);
          break;
        }
        if (
          cursor != null &&
          cursor === document.body &&
          isScrollable(cursor) &&
          !isScrollable(document.documentElement)
        ) {
          continue;
        }
        if (
          cursor != null &&
          isScrollable(cursor, skipOverflowHiddenElements)
        ) {
          frames.push(cursor);
        }
      }
      const viewportWidth =
        (_b = (_a = window.visualViewport) == null ? void 0 : _a.width) != null
          ? _b
          : innerWidth;
      const viewportHeight =
        (_d = (_c = window.visualViewport) == null ? void 0 : _c.height) != null
          ? _d
          : innerHeight;
      const { scrollX, scrollY } = window;
      const {
        height: targetHeight,
        width: targetWidth,
        top: targetTop,
        right: targetRight,
        bottom: targetBottom,
        left: targetLeft,
      } = target.getBoundingClientRect();
      var targetBlock =
        block === "start" || block === "nearest"
          ? targetTop
          : block === "end"
          ? targetBottom
          : targetTop + targetHeight / 2;
      var targetInline =
        inline === "center"
          ? targetLeft + targetWidth / 2
          : inline === "end"
          ? targetRight
          : targetLeft;
      const computations = [];
      for (var index = 0; index < frames.length; index++) {
        const frame = frames[index];
        const { height, width, top, right, bottom, left } =
          frame.getBoundingClientRect();
        if (
          scrollMode === "if-needed" &&
          targetTop >= 0 &&
          targetLeft >= 0 &&
          targetBottom <= viewportHeight &&
          targetRight <= viewportWidth &&
          targetTop >= top &&
          targetBottom <= bottom &&
          targetLeft >= left &&
          targetRight <= right
        ) {
          return computations;
        }
        const frameStyle = getComputedStyle(frame);
        const borderLeft = parseInt(frameStyle.borderLeftWidth, 10);
        const borderTop = parseInt(frameStyle.borderTopWidth, 10);
        const borderRight = parseInt(frameStyle.borderRightWidth, 10);
        const borderBottom = parseInt(frameStyle.borderBottomWidth, 10);
        var blockScroll = 0;
        var inlineScroll = 0;
        const scrollbarWidth =
          "offsetWidth" in frame
            ? frame.offsetWidth - frame.clientWidth - borderLeft - borderRight
            : 0;
        const scrollbarHeight =
          "offsetHeight" in frame
            ? frame.offsetHeight - frame.clientHeight - borderTop - borderBottom
            : 0;
        const scaleX =
          "offsetWidth" in frame
            ? frame.offsetWidth === 0
              ? 0
              : width / frame.offsetWidth
            : 0;
        const scaleY =
          "offsetHeight" in frame
            ? frame.offsetHeight === 0
              ? 0
              : height / frame.offsetHeight
            : 0;
        if (scrollingElement === frame) {
          if (block === "start") {
            blockScroll = targetBlock;
          } else if (block === "end") {
            blockScroll = targetBlock - viewportHeight;
          } else if (block === "nearest") {
            blockScroll = alignNearest(
              scrollY,
              scrollY + viewportHeight,
              viewportHeight,
              borderTop,
              borderBottom,
              scrollY + targetBlock,
              scrollY + targetBlock + targetHeight,
              targetHeight
            );
          } else {
            blockScroll = targetBlock - viewportHeight / 2;
          }
          if (inline === "start") {
            inlineScroll = targetInline;
          } else if (inline === "center") {
            inlineScroll = targetInline - viewportWidth / 2;
          } else if (inline === "end") {
            inlineScroll = targetInline - viewportWidth;
          } else {
            inlineScroll = alignNearest(
              scrollX,
              scrollX + viewportWidth,
              viewportWidth,
              borderLeft,
              borderRight,
              scrollX + targetInline,
              scrollX + targetInline + targetWidth,
              targetWidth
            );
          }
          blockScroll = Math.max(0, blockScroll + scrollY);
          inlineScroll = Math.max(0, inlineScroll + scrollX);
        } else {
          if (block === "start") {
            blockScroll = targetBlock - top - borderTop;
          } else if (block === "end") {
            blockScroll = targetBlock - bottom + borderBottom + scrollbarHeight;
          } else if (block === "nearest") {
            blockScroll = alignNearest(
              top,
              bottom,
              height,
              borderTop,
              borderBottom + scrollbarHeight,
              targetBlock,
              targetBlock + targetHeight,
              targetHeight
            );
          } else {
            blockScroll =
              targetBlock - (top + height / 2) + scrollbarHeight / 2;
          }
          if (inline === "start") {
            inlineScroll = targetInline - left - borderLeft;
          } else if (inline === "center") {
            inlineScroll =
              targetInline - (left + width / 2) + scrollbarWidth / 2;
          } else if (inline === "end") {
            inlineScroll = targetInline - right + borderRight + scrollbarWidth;
          } else {
            inlineScroll = alignNearest(
              left,
              right,
              width,
              borderLeft,
              borderRight + scrollbarWidth,
              targetInline,
              targetInline + targetWidth,
              targetWidth
            );
          }
          const { scrollLeft, scrollTop } = frame;
          blockScroll = Math.max(
            0,
            Math.min(
              scrollTop + blockScroll / scaleY,
              frame.scrollHeight - height / scaleY + scrollbarHeight
            )
          );
          inlineScroll = Math.max(
            0,
            Math.min(
              scrollLeft + inlineScroll / scaleX,
              frame.scrollWidth - width / scaleX + scrollbarWidth
            )
          );
          targetBlock += scrollTop - blockScroll;
          targetInline += scrollLeft - inlineScroll;
        }
        computations.push({
          el: frame,
          top: blockScroll,
          left: inlineScroll,
        });
      }
      return computations;
    };
    return compute;
  })());
  window.scrollIntoView = (() => {
    const isStandardScrollBehavior = (options) =>
      options === Object(options) && Object.keys(options).length !== 0;
    const isCustomScrollBehavior = (options) =>
      typeof options === "object"
        ? typeof options.behavior === "function"
        : false;
    const getOptions = (options) => {
      if (options === false) {
        return {
          block: "end",
          inline: "nearest",
        };
      }
      if (isStandardScrollBehavior(options)) {
        return options;
      }
      return {
        block: "start",
        inline: "nearest",
      };
    };
    const isInDocument = (element) => {
      var currentElement = element;
      while (currentElement && currentElement.parentNode) {
        if (currentElement.parentNode === document) {
          return true;
        } else if (
          window.ShadowRoot &&
          currentElement.parentNode instanceof window.ShadowRoot
        ) {
          currentElement = currentElement.parentNode.host;
        } else {
          currentElement = currentElement.parentNode;
        }
      }
      return false;
    };
    function scrollIntoView(target, options) {
      if (
        !target.ownerDocument ||
        target.ownerDocument.compareDocumentPosition(target) &
          this.DOCUMENT_POSITION_DISCONNECTED ||
        !isInDocument(target)
      ) {
        return;
      }
      if (isCustomScrollBehavior(options)) {
        return options.behavior(compute(target, options));
      }
      const behavior =
        typeof options === "boolean"
          ? void 0
          : options == null
          ? void 0
          : options.behavior;
      for (var { el, top, left } of compute(target, getOptions(options))) {
        el.scroll({
          top,
          left,
          behavior,
        });
      }
    }
    return scrollIntoView;
  })();
})();
