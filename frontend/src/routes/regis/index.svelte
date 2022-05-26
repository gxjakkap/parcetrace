<script lang="ts">
    import { page } from "$app/stores";
    import { API_KEY } from "$lib/env";

    let apikey: string = "";

    if (process.env.NODE_ENV === "production") {
        apikey = process.env.API_KEY as string;
    } else {
        apikey = API_KEY;
    }

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
    $: userData.room = userData.room.replace(/[^a-zA-Z0-9\s]+$/, "");
    $: userData.phoneNumber = userData.phoneNumber.replace(/[^0-9\s]+$/, "");

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
        if (
            !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
                userData.phoneNumber
            )
        ) {
            alert("เบอร์โทรศัพท์ไม่ถูกต้อง");
            return;
        }
        fetch("https://api.guntxjakka.me/userreg", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                authorization: apikey,
            },
            body: JSON.stringify(userData),
        })
            .then((res) => {
                //TODO: remove console.log
                if (res.status === 200) {
                    location.replace("/regis/success");
                } else if (res.status === 409) {
                    console.log(res);
                    alert("คุณได้ลงทะเบียนไปแล้ว");
                } else if (res.status === 500) {
                    console.log(res);
                    alert(
                        "เกิดข้อผิดพลาดขึ้นกับเซิร์ฟเวอร์ลงทะเบียน โปรดลองใหม่อีกครั้ง"
                    ); //TODO: show error modal instead of alert
                } else {
                    console.log(res);
                    alert("มีข้อผิดพลาดบางอย่าง"); //TODO: show error modal instead of alert
                }
            })
            .catch((err) => {
                console.log(err);
            });
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
                        type="tel"
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
        <!--if userId doesn't exist/ is null-->
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
