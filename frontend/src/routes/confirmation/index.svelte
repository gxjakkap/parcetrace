<script lang="ts">
    import { page } from "$app/stores";
    import { API_KEY, API_URL } from "$lib/env";
    import Loading from "$lib/loading.svelte";
    import Status from "$lib/statuspage.svelte";

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

    interface userParcel {
        date: number;
        sender: string;
        location: string;
        status: "available" | "lost" | "found";
        parcelId: string;
    }

    let loadingStateAfterSubmit: boolean = false;

    //get parcelId from params
    let parcelId: string | null = $page.url.searchParams.get("pid");

    //validate parcelid with UUIDv4 standards
    if (
        parcelId &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            parcelId
        )
    ) {
        parcelId = null;
    }

    async function getParcelData(parcelId: string | null) {
        return fetch(`https://${apiUrl}/getparceldata?parcelId=${parcelId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                authorization: apikey,
            },
        });
    }

    async function parcelRecieved(parcelId: string | null) {
        loadingStateAfterSubmit = true;
        return fetch(`https://${apiUrl}/parcelrem`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                authorization: apikey,
            },
            body: JSON.stringify({
                parcelId: parcelId,
            }),
        });
    }

    function waitforData(): Promise<userParcel> {
        return new Promise((resolve, reject) => {
            getParcelData(parcelId).then((res) => {
                if (res.status === 200) {
                    res.json().then((data) => {
                        resolve(data.data);
                    });
                } else if (res.status === 404) {
                    reject(res.status);
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

<main>
    <div class="bg-gray-200 dark:bg-slate-800 min-h-screen flex flex-col">
        {#if parcelId}
            {#if !loadingStateAfterSubmit}
                {#await waitforData()}
                    <Loading />
                {:then parcel}
                    <div
                        class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
                    >
                        <div
                            class="bg-white dark:bg-slate-700 px-6 py-8 rounded shadow-md text-black dark:text-white w-full"
                        >
                            <h1 class="font-Prompt mb-8 text-3xl text-center">
                                ยืนยันการรับพัสดุ
                            </h1>
                            <p class="font-Prompt text-center">
                                <b>ยืนยันการรับพัสดุจาก:</b>
                                {parcel.sender}
                            </p>
                            <p class="font-Prompt mb-4 text-center">
                                <b>พัสดุมาถึงเมื่อ:</b>
                                {localeDateString(parcel.date)}
                            </p>
                            <button
                                type="submit"
                                class="font-Prompt w-full text-center py-3 rounded bg-green-500 dark:bg-green-600 text-white hover:bg-green-700 focus:outline-none my-1"
                                on:click={() => {
                                    parcelRecieved(parcelId).then((res) => {
                                        if (res.status === 200) {
                                            location.replace(
                                                "/confirmation/success"
                                            );
                                        } else {
                                            console.log(res);
                                            alert("มีข้อผิดพลาดบางอย่าง"); //TODO: show error modal instead of alert
                                        }
                                    });
                                }}
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                {:catch error}
                    {#if error === 404}
                        <Status message="ไม่พบพัสดุ" />
                    {:else}
                        <Status message="Error" />
                    {/if}
                {/await}
            {:else}
                <Loading />
            {/if}
        {:else}
            <!--if parcelId doesn't exist/ is null-->
            <div class="bg-gray-200 min-h-screen flex flex-col">
                <div
                    class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
                >
                    <div
                        class="bg-white px-6 py-8 rounded shadow-md text-black w-full"
                    >
                        <h1 class="font-Prompt mb-8 text-3xl text-center">
                            Error: parcelId is missing or invalid.
                        </h1>
                        <br />
                        <p class="text-center">
                            Click <a
                                href="/"
                                class="text-blue-700 underline hover:text-sky-500"
                                >here</a
                            > to go back home.
                        </p>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</main>
