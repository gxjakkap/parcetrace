<script lang="ts">
    import { page } from "$app/stores";
    /* import { onMount } from "svelte"; */
    import { API_KEY, API_URL } from "$lib/env";

    let apikey: string;
    let apiUrl: string;

    //check for environment and set api key and url
    if (process.env.NODE_ENV === "production") {
        apikey = process.env.API_KEY as string;
        apiUrl = process.env.API_URL as string;
    } else {
        apikey = API_KEY;
        apiUrl = API_URL;
    }

    interface parcels {
        date?: number;
        carrier?: string;
        status?: "available" | "lost" | "found";
    }

    interface responsedata {
        status: number;
        parcels: parcels[];
    }

    //get userId params from url (https://domain.ext/parcecheck?userId="userId")
    let userId: string | null = $page.url.searchParams.get("userId") || null;

    //mock data for test
    /* let data: data[] = [
        { date: 1653831551000, carrier: "Kerry", status: "available" },
        { date: 1653853361000, carrier: "ThaiPost", status: "available" },
        { date: 1649952755000, carrier: "LEX TH", status: "lost" },
    ]; */

    //validate userId with regex. if input doesn't match, make it null to display error
    if (userId && !/U[0-9a-f]{32}/.test(userId)) {
        userId = null;
    }

    //fetches data from api
    async function getData() {
        return fetch(`https://${apiUrl}/parcelcheck?userId=${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                authorization: apikey,
            },
        });
    }

    function waitforData(): Promise<responsedata> {
        return new Promise((resolve, reject) => {
            getData().then((res) => {
                if (res.status === 200) {
                    res.json().then((data) => {
                        resolve(data);
                    });
                } else {
                    reject(res.status);
                }
            });
        });
    }

    // get date string from epoch
    const localeDateString = (date: any) => {
        let epdate = new Date(date);
        return epdate.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
    };
</script>

<svelte:head>
    <title>Parcel Check - Parcetrace</title>
</svelte:head>

<main>
    {#await waitforData()}
        <div class="bg-gray-200 dark:bg-slate-800 min-h-screen flex flex-col">
            <div
                class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
            >
                <div
                    class="bg-white dark:bg-slate-700 px-6 py-8 rounded shadow-md text-black w-full"
                >
                    <div class="flex justify-center items-center">
                        <div
                            class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                            role="status"
                        />
                    </div>
                    <h1
                        class="font-Prompt text-black dark:text-white mb-8 text-3xl text-center"
                    >
                        กำลังโหลดข้อมูล
                    </h1>
                </div>
            </div>
        </div>
    {:then data}
        <h1
            class="font-Prompt text-black dark:text-white text-center text-4xl px-3 mb-5 mt-5"
        >
            พัสดุของคุณ
        </h1>
        {#if data.parcels.length >= 1}
            <div
                class="relative overflow-x-auto shadow-md sm:rounded-lg ml-3 mr-3"
            >
                <table
                    class="w-full text-sm text-left text-gray-500 dark:text-gray-400"
                >
                    <thead
                        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
                    >
                        <tr>
                            <th scope="col" class="font-Prompt px-6 py-3">
                                วันที่
                            </th>
                            <th scope="col" class="font-Prompt px-6 py-3">
                                พัสดุจาก
                            </th>
                            <th scope="col" class="font-Prompt px-6 py-3">
                                สถานะ
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.parcels as d}
                            <tr
                                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                            >
                                <th
                                    scope="row"
                                    class="font-Prompt px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                                >
                                    {localeDateString(d.date)}
                                </th>
                                <td
                                    class="font-Prompt text-gray-900 dark:text-white px-6 py-4"
                                >
                                    {d.carrier}
                                </td>
                                {#if d.status === "available"}
                                    <td
                                        class="font-Prompt text-green-500 px-6 py-4"
                                    >
                                        อยู่ที่นิติบุคคล
                                    </td>
                                {:else if d.status === "found"}
                                    <td
                                        class="font-Prompt text-orange-400 dark:text-orange-300 px-6 py-4"
                                    >
                                        พบแล้ว โปรดติดต่อนิติบุคคล
                                    </td>
                                {:else}
                                    <td
                                        class="font-Prompt text-red-500 px-6 py-4"
                                    >
                                        สูญหาย
                                    </td>
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {:else}
            <div
                class="drop-shadow-lg container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
            >
                <div
                    class="bg-slate-200 dark:bg-slate-900 px-6 py-8 rounded shadow-md text-black w-full"
                >
                    <h1
                        class="font-Prompt text-black dark:text-white mb-8 mt-8 text-3xl text-center"
                    >
                        คุณไม่มีพัสดุในระบบ
                    </h1>
                </div>
            </div>
        {/if}
    {/await}
</main>
