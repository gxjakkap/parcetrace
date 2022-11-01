<script lang="ts">
    import Statuspage from "$lib/statuspage.svelte";
</script>

<svelte:head>
    <title>Register Succeed - Parcetrace</title>
</svelte:head>

<main>
    <Statuspage message="การลงทะเบียนสำเร็จ คุณสามารถปิดหน้านี้ได้">
        <svelte:fragment slot="body">
            <p class="text-center">
                Click <a
                    href="/"
                    class="text-blue-700 underline hover:text-sky-500">here</a
                > to go back home.
            </p>
        </svelte:fragment>
    </Statuspage>
</main>
