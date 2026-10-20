import { useRef, type DragEvent, type MouseEvent, type PointerEvent } from "react";

const DRAG_THRESHOLD_PX = 5;

/**
 * Lets mouse users drag a horizontal scroller like on touch. Touch and pen keep native scrolling.
 * Spread the returned props on the scroll container.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0, snap: "" });

  function onPointerDown(e: PointerEvent<T>) {
    drag.current.moved = false;
    if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startScroll: ref.current.scrollLeft, snap: "" };
  }

  function onPointerMove(e: PointerEvent<T>) {
    const el = ref.current;
    const state = drag.current;
    if (!state.active || !el) return;

    const dx = e.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      state.moved = true;
      el.setPointerCapture(e.pointerId);
      // Snapping fights a manual scroll; turn it off while dragging and restore it on release.
      state.snap = el.style.scrollSnapType;
      el.style.scrollSnapType = "none";
      el.style.cursor = "grabbing";
    }
    el.scrollLeft = state.startScroll - dx;
  }

  function endDrag(e: PointerEvent<T>) {
    const el = ref.current;
    const state = drag.current;
    if (!state.active || !el) return;
    state.active = false;
    if (!state.moved) return;

    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    el.style.cursor = "";
    const left = el.scrollLeft;
    el.style.scrollSnapType = state.snap;
    // Restoring snap makes the browser jump to the nearest item; start from where the drag ended so it animates.
    el.scrollLeft = left;
  }

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    // A drag that ends over a button must not also click it.
    onClickCapture: (e: MouseEvent) => {
      if (drag.current.moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    // Stop the browser's native image/link dragging from hijacking the gesture.
    onDragStart: (e: DragEvent) => e.preventDefault(),
  };
}
