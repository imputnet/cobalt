<script lang="ts">
  let {
    min = 0,
    max = 1,
    start = $bindable(0),
    end = $bindable(1),
    step = 0.001,
  } = $props();

  let track: HTMLDivElement;
  let dragging = $state<"start" | "end" | null>(null);
  let focused = $state<"start" | "end" | null>(null);

  $effect(() => {
    function handleDocumentClick(e: MouseEvent) {
      if (track && !track.contains(e.target as Node)) {
        focused = null;
      }
    }
    
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  });

  function percent(val: number) {
    return ((val - min) / (max - min)) * 100;
  }

  function clamp(val: number, minVal: number, maxVal: number) {
    return Math.max(minVal, Math.min(maxVal, val));
  }

  function posToValue(clientX: number) {
    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return min + ratio * (max - min);
  }

  function handlePointerDown(e: PointerEvent, which: "start" | "end") {
    dragging = which;
    focused = which;
    track.setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    e.preventDefault();
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragging) return;
    let val = posToValue(e.clientX);
    val = Math.round(val / step) * step;
    if (dragging === "start") {
      start = clamp(val, min, end);
      if (start > end) start = end;
    } else {
      end = clamp(val, start, max);
      if (end < start) end = start;
    }
  }

  function handlePointerUp(e: PointerEvent) {
    if (dragging) {
      track.releasePointerCapture(e.pointerId);
    }
    dragging = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  function handleTrackClick(e: MouseEvent) {
    if (dragging) return;
    const val = posToValue(e.clientX);
    if (Math.abs(val - start) < Math.abs(val - end)) {
      start = clamp(val, min, end);
      focused = "start";
    } else {
      end = clamp(val, start, max);
      focused = "end";
    }
  }

  function handleTrackKeydown(e: KeyboardEvent) {
    if (e.key.startsWith("Arrow") || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      handleKeydown(e, focused || "start");
    }
  }

  function handleKeydown(e: KeyboardEvent, which: "start" | "end") {
    const bigStep = (max - min) / 20;
    const smallStep = step;
    let newVal: number;
    
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        newVal = (which === "start" ? start : end) - (e.shiftKey ? bigStep : smallStep);
        break;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        newVal = (which === "start" ? start : end) + (e.shiftKey ? bigStep : smallStep);
        break;
      case "Home":
        e.preventDefault();
        newVal = which === "start" ? min : start;
        break;
      case "End":
        e.preventDefault();
        newVal = which === "start" ? end : max;
        break;
      default:
        return;
    }

    if (which === "start") {
      start = clamp(newVal, min, end);
    } else {
      end = clamp(newVal, start, max);
    }
  }
</script>

<div class="slider-container">
  <div 
    class="slider" 
    bind:this={track} 
    onclick={handleTrackClick}
    onkeydown={handleTrackKeydown}
    role="slider"
    aria-valuenow={start}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-label="Clip range selector"
    tabindex="0"
  >
    <div class="slider-track"></div>
    <div
      class="slider-range"
      style="left: {percent(start)}%; right: {100 - percent(end)}%"
    ></div>
    <div
      class="slider-handle start"
      class:focused={focused === "start"}
      class:dragging={dragging === "start"}
      style="left: {percent(start)}%"
      tabindex="0"
      role="slider"
      aria-label="Start time"
      aria-valuemin={min}
      aria-valuemax={end}
      aria-valuenow={start}
      onpointerdown={(e) => handlePointerDown(e, 'start')}
      onkeydown={(e) => handleKeydown(e, 'start')}
      onfocus={() => focused = "start"}
      onblur={() => focused = null}
    >
      <div class="handle-tooltip" class:visible={dragging === "start" || focused === "start"}>
        {Math.floor(start / 60)}:{String(Math.floor(start % 60)).padStart(2, '0')}
      </div>
    </div>
    <div
      class="slider-handle end"
      class:focused={focused === "end"}
      class:dragging={dragging === "end"}
      style="left: {percent(end)}%"
      tabindex="0"
      role="slider"
      aria-label="End time"
      aria-valuemin={start}
      aria-valuemax={max}
      aria-valuenow={end}
      onpointerdown={(e) => handlePointerDown(e, 'end')}
      onkeydown={(e) => handleKeydown(e, 'end')}
      onfocus={() => focused = "end"}
      onblur={() => focused = null}
    >
      <div class="handle-tooltip" class:visible={dragging === "end" || focused === "end"}>
        {Math.floor(end / 60)}:{String(Math.floor(end % 60)).padStart(2, '0')}
      </div>
    </div>
  </div>
</div>

<style>
.slider-container {
  position: relative;
  margin: 16px 0 12px 0;
  padding: 0 4px;
}

.slider {
  position: relative;
  height: 32px;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.slider:hover .slider-track {
  background: var(--input-border);
  transform: translateY(-50%) scaleY(1.2);
}

.slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  background: var(--button-hover);
  border-radius: 3px;
  transform: translateY(-50%);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.slider-range {
  position: absolute;
  top: 50%;
  height: 8px;
  background: linear-gradient(90deg, var(--secondary) 0%);
  border-radius: 4px;
  transform: translateY(-50%);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.slider:hover .slider-range {
  height: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
}

.slider-handle {
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  background: var(--primary);
  border: 2.5px solid var(--secondary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  outline: none;
}

.slider-handle:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border-width: 3px;
}

.slider-handle.focused {
  border-color: var(--secondary);
  transform: translate(-50%, -50%) scale(1.05);
}

.slider-handle.dragging {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.15);
  border-color: var(--secondary);
  background: var(--primary);
}

.slider-handle.start {
  background: linear-gradient(135deg, var(--primary) 0%, #f8f8f8 100%);
}

.slider-handle.end {
  background: linear-gradient(135deg, var(--primary) 0%, #f0f0f0 100%);
}

.handle-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: var(--secondary);
  color: var(--primary);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.handle-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--secondary);
}

.handle-tooltip.visible {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-12px);
}

@media (max-width: 768px) {
  .slider {
    height: 36px;
  }
  
  .slider-handle {
    width: 24px;
    height: 24px;
    border-width: 3px;
  }
  
  .slider-track {
    height: 8px;
  }
  
  .slider-range {
    height: 10px;
  }
  
  .slider:hover .slider-range {
    height: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slider,
  .slider-track,
  .slider-range,
  .slider-handle,
  .handle-tooltip {
    transition: none;
  }
}
</style>
