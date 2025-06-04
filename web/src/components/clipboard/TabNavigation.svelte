<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    export let activeTab: 'files' | 'text';
    
    const dispatch = createEventDispatcher<{
        tabChange: 'files' | 'text'
    }>();
</script>

<div class="tab-navigation">
    <button 
        class="tab-button" 
        class:active={activeTab === 'files'}
        on:click={() => dispatch('tabChange', 'files')}
    >
        📁 文件传输
    </button>
    <button 
        class="tab-button" 
        class:active={activeTab === 'text'}
        on:click={() => dispatch('tabChange', 'text')}
    >
        📝 文本分享
    </button>
</div>

<style>
    .tab-navigation {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        padding: 0.25rem;
        background-color: var(--button);
        border-radius: 0.5rem;
        max-width: fit-content;
        margin: 0 auto 1.5rem auto;
    }

    .tab-button {
        padding: 0.75rem 1.5rem;
        border: none;
        background-color: transparent;
        color: var(--secondary);
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .tab-button:hover {
        background-color: var(--button-hover);
        color: var(--text);
    }

    .tab-button.active {
        background-color: var(--secondary);
        color: var(--primary);
        cursor: default;
    }

    .tab-button.active:hover {
        background-color: var(--secondary);
        color: var(--primary);
    }

    @media (max-width: 768px) {
        .tab-navigation {
            width: 100%;
            max-width: none;
        }
        
        .tab-button {
            flex: 1;
            justify-content: center;
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
        }
    }
</style>
