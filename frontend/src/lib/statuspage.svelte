<script lang="ts">
    export let message: string;
</script>

<div class="bg-gray-200 dark:bg-slate-800 min-h-screen flex flex-col">
    <div
        class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
    >
        <div
            class="bg-white dark:bg-slate-700 px-6 py-8 rounded shadow-md text-black dark:text-white w-full"
        >
            <h1 class="font-Prompt mb-8 text-3xl text-center">
                {message}
            </h1>
            <slot name="body" />
        </div>
    </div>
</div>
