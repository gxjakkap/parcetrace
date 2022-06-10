<script lang="ts">
    import { page } from "$app/stores";
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

    async function parcelRecieved(parcelId: string | null) {
        return fetch(`https://${apiUrl}/parcel`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                authorization: apikey,
            },
            body: JSON.stringify({ parcelId: parcelId }),
        });
    }
</script>

<main>
    <div class="bg-gray-200 min-h-screen flex flex-col">
        {#if parcelId}
            <div
                class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
            >
                <div
                    class="bg-white px-6 py-8 rounded shadow-md text-black w-full"
                >
                    <h1 class="font-Prompt mb-8 text-3xl text-center">
                        ยืนยันการรับพัสดุ
                    </h1>
                    <p>ยืนยันการรับพัสดุจาก</p>
                    <button
                        type="submit"
                        class="font-Prompt w-full text-center py-3 rounded bg-green-500 text-white hover:bg-green-700 focus:outline-none my-1"
                        on:click={() => {
                            parcelRecieved(parcelId).then((res) => {
                                if (res.status === 200) {
                                    location.replace("/parcelcheck/success");
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
