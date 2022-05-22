<script lang="ts">
    import { page } from "$app/stores";

    //get userId params from url (https://domain.ext/reqis?userId="userId")
    let userId: string | null = $page.url.searchParams.get("userId") || null;

    //validate userId with regex. if input doesn't match, make it null to display error
    if (userId && !/U[0-9a-f]{32}/.test(userId)) {
        userId = null;
    }

    //create object to store data
    let userData = {
        userId: userId,
        name: "",
        surname: "",
        room: "",
        phoneNumber: "",
    };

    // only allow valid character for each fields
    $: userData.name = userData.name.replace(/[^.a-zA-Zก-๏\s]+$/, "");
    $: userData.surname = userData.surname.replace(/[^a-zA-Zก-๏\s]+$/, "");
    $: userData.room = userData.room.replace(/[^a-zA-Zก-๏\s]+$/, "");
    $: userData.phoneNumber = userData.phoneNumber.replace(
        /[^a-zA-Zก-๏\s]+$/,
        ""
    );

    //post data to api on button click
    async function onSubmit() {
        if (
            !userData.name ||
            !userData.surname ||
            !userData.room ||
            !userData.phoneNumber
        ) {
            alert("กรุณากรอกข้อมูลให้ครบ");
            return;
        }
        alert(userData.name);
        /* await fetch("https://api.guntxjakka.me/userreg", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer ".concat(process.env.API_KEY as string),
            },
        }); */
    }
</script>

<!--page title-->
<svelte:head>
    <title>Register - Parcetrace</title>
</svelte:head>

<main>
    {#if userId}
        <!--if userId exist-->
        <div class="bg-gray-200 min-h-screen flex flex-col">
            <div
                class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
            >
                <div
                    class="bg-white px-6 py-8 rounded shadow-md text-black w-full"
                >
                    <h1 class="font-Prompt mb-8 text-3xl text-center">
                        ลงทะเบียน
                    </h1>
                    <input
                        type="text"
                        readonly
                        class="font-Prompt block border border-gray-400 text-gray-500 w-full p-3 rounded focus:outline-none mb-4 cursor-not-allowed"
                        bind:value={userId}
                    />

                    <input
                        type="text"
                        class="font-Prompt block border border-gray-400 w-full p-3 rounded mb-4"
                        placeholder="ชื่อจริง"
                        bind:value={userData.name}
                    />

                    <input
                        type="text"
                        class="font-Prompt block border border-gray-400 w-full p-3 rounded mb-4"
                        placeholder="นามสกุล"
                        bind:value={userData.surname}
                    />

                    <input
                        type="text"
                        class="font-Prompt block border border-gray-400 w-full p-3 rounded mb-4"
                        placeholder="เลขห้อง"
                        bind:value={userData.room}
                    />

                    <input
                        type="text"
                        class="font-Prompt block border border-gray-400 w-full p-3 rounded mb-4"
                        placeholder="เบอร์โทรติดต่อ"
                        bind:value={userData.phoneNumber}
                    />

                    <button
                        type="submit"
                        class="font-Prompt w-full text-center py-3 rounded bg-green-500 text-white hover:bg-green-700 focus:outline-none my-1"
                        on:click={onSubmit}>ส่งข้อมูล</button
                    >
                </div>
            </div>
        </div>
    {:else}
        <!--if userId isn't exist/ is null-->
        <div class="bg-gray-200 min-h-screen flex flex-col">
            <div
                class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2"
            >
                <div
                    class="bg-white px-6 py-8 rounded shadow-md text-black w-full"
                >
                    <h1 class="mb-8 text-3xl text-center">
                        Error: userId is missing or invalid.
                    </h1>
                </div>
            </div>
        </div>
    {/if}
</main>
