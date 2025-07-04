<script lang="ts">
    import { hapticSwitch } from "$lib/haptics";
    
    export let checked: boolean;
    export let onclick: () => void;

    const handleClick = () => {
        hapticSwitch();
        onclick();
    };
</script>

<button 
    id="button-clip-checkbox" 
    class="clip-toggle button" 
    class:active={checked}
    on:click={handleClick}
    aria-pressed={checked}
    aria-label="Toggle clip mode"
>
    <div class="toggle-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <polyline points="8,12 12,16 16,8" opacity={checked ? 1 : 0.3} stroke-width={checked ? 2.5 : 2}></polyline>
        </svg>
    </div>
    <span class="clip-label">Clip</span>
</button>

<style>
    .clip-toggle {
        position: relative;
        font-weight: 500;
        font-size: 14px;
        padding: 8px 12px;
        gap: 8px;
        transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
        border: 1.5px solid transparent;
        min-width: fit-content;
    }

    .clip-toggle:not(.active) {
        background: var(--button);
        color: var(--button-text);
    }

    .clip-toggle.active {
        background: var(--secondary);
        color: var(--primary);
        border-color: var(--secondary);
    }

    .toggle-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
    }

    .clip-toggle.active .toggle-icon {
        transform: scale(1.05);
    }

    .toggle-icon svg {
        transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    }

    .clip-toggle.active .toggle-icon svg {
        filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
    }

    .clip-label {
        font-weight: 500;
        letter-spacing: -0.02em;
    }

    @media (hover: hover) {
        .clip-toggle:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .clip-toggle.active:hover {
            background: var(--button-active-hover);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
    }

    .clip-toggle:active {
        transform: translateY(0);
        transition-duration: 0.1s;
    }

    @media screen and (max-width: 440px) {
        .clip-toggle {
            padding: 10px 16px;
            font-size: 14.5px;
        }
    }
</style>
