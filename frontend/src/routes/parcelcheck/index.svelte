<script lang="ts">
    import { page } from "$app/stores";

    //get userId params from url (https://domain.ext/parcecheck?userId="userId")
    let userId: string | null = $page.url.searchParams.get("userId") || null;
</script>

<svelte:head>
    <title>Parcel Check - Parcetrace</title>
</svelte:head>

<main>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
            class="w-full text-sm text-left text-gray-500 dark:text-gray-400"
        >
            <thead
                class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
            >
                <tr>
                    <th scope="col" class="px-6 py-3"> วันที่ </th>
                    <th scope="col" class="px-6 py-3"> พัสดุจาก </th>
                    <th scope="col" class="px-6 py-3"> สถานะ </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                    >
                        Apple MacBook Pro 17"
                    </th>
                    <td class="px-6 py-4"> Sliver </td>
                    <td class="px-6 py-4"> Laptop </td>
                </tr>
                <tr
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                    >
                        Microsoft Surface Pro
                    </th>
                    <td class="px-6 py-4"> White </td>
                    <td class="px-6 py-4"> Laptop PC </td>
                </tr>
                <tr class="bg-white dark:bg-gray-800">
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                    >
                        Magic Mouse 2
                    </th>
                    <td class="px-6 py-4"> Black </td>
                    <td class="px-6 py-4"> Accessories </td>
                </tr>
            </tbody>
        </table>
    </div>
</main>
