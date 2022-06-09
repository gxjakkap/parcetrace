<script lang="ts">
    import { API_KEY, API_URL } from "$lib/env";

    //check for environment and set api key and url
    const apikey =
        process.env.NODE_ENV === "production" ? process.env.API_KEY : API_KEY;
    const apiUrl =
        process.env.NODE_ENV === "production" ? process.env.API_URL : API_URL;

    let phoneNumber: number | null;

    let loadingState = false;

    async function onSubmit() {
        fetch(`https://${apiUrl}/getUserId?phoneNo=${phoneNumber}`, {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                authorization: apikey as string,
            },
        }).then((res) => {
            if (res.status === 200) {
                res.json().then((data) => {
                    location.replace(
                        "/parcelcheck/res?userId=".concat(data.userId)
                    );
                });
            } else {
                console.log(res);
                alert("มีข้อผิดพลาดบางอย่าง"); //TODO: show error modal instead of alert
            }
        });
    }
</script>

<svelte:head>
    <title>Parcel Check - Parcetrace</title>
</svelte:head>

<main>
    {#if !loadingState}
        <div class="bg-gray-200 dark:bg-slate-800 min-h-screen flex flex-col">
            <div
                class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
            >
                <div
                    class="bg-white dark:bg-gray-700 px-6 py-8 rounded shadow-md text-black w-full"
                >
                    <h1
                        class="font-Prompt mb-8 text-3xl text-center text-black dark:text-white"
                    >
                        ตรวจสอบพัสดุ
                    </h1>
                    <input
                        type="tel"
                        class="font-Prompt block border border-gray-400 dark:border-gray-700 text-black dark:text-white w-full p-3 rounded mb-4 bg-white dark:bg-slate-500"
                        placeholder="เบอร์โทรศัพท์"
                        on:keypress={(e) => {
                            if (e.key === "Enter") {
                                onSubmit();
                            }
                        }}
                        bind:value={phoneNumber}
                    />

                    <button
                        type="submit"
                        class="font-Prompt w-full text-center py-3 rounded bg-green-500 text-white hover:bg-green-700 focus:outline-none my-1"
                        on:click={onSubmit}>ค้นหา</button
                    >
                </div>
            </div>
        </div>
    {:else}
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
    {/if}
</main>
