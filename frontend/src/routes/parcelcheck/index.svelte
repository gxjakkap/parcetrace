<script lang="ts">
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

    let phoneNumber: number | null;

    async function onSubmit() {
        fetch(`https://${apiUrl}/getUserId`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                authorization: apikey,
            },
            body: JSON.stringify({ phoneNumber: phoneNumber }),
        }).then((res) => {
            if (res.status === 200) {
                location.replace("/parcelcheck/res?q=".concat("userId"));
            } else {
                console.log(res);
                alert("มีข้อผิดพลาดบางอย่าง"); //TODO: show error modal instead of alert
            }
        });
    }
</script>

<main>
    <div class="bg-gray-200 min-h-screen flex flex-col">
        <div
            class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
        >
            <div class="bg-white px-6 py-8 rounded shadow-md text-black w-full">
                <h1 class="font-Prompt mb-8 text-3xl text-center">
                    ตรวจสอบพัสดุ
                </h1>
                <input
                    type="tel"
                    class="font-Prompt block border border-gray-400 w-full p-3 rounded mb-4"
                    placeholder="เบอร์โทรศัพท์"
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
</main>
