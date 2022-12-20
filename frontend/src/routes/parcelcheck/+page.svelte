<script lang="ts">
    import { API_KEY, API_URL } from "$lib/env";
    import Loading from "$lib/loading.svelte";
    import Modal from "$lib/modal.svelte";

    //check for environment and set api key and url
    const apikey =
        process.env.NODE_ENV === "production" ? process.env.API_KEY : API_KEY;
    const apiUrl =
        process.env.NODE_ENV === "production" ? process.env.API_URL : API_URL;
    const baseUrl = process.env.VERCEL_URL ? process.env.VERCEL_URL : '127.0.0.1:5173'

    let phoneNumber: string = "";

    $: phoneNumber = phoneNumber.replace(/[^0-9\s]+$/, "");

    let loadingState = false;
    let modalState = {
        open: false,
        title: "defaultTitle",
        message: "defaultMessage",
    };

    const toggleModal = () => {
        modalState.open = !modalState.open;
    };

    async function onSubmit() {
        if (phoneNumber.length < 10) {
            console.log(phoneNumber.length < 10);
            toggleModal();
            modalState.title = "Error";
            modalState.message = "เบอร์โทรศัพท์ไม่ถูกต้อง";
            return;
        }
        loadingState = true;
        fetch(`https://${baseUrl}/api/getuserid?phoneNo=${phoneNumber}`, {
            method: "GET",
            cache: "no-cache",
        }).then((res) => {
            if (res.status === 200) {
                res.json().then((data) => {
                    location.replace(
                        "/parcelcheck/res?userId=".concat(data.userId)
                    );
                });
            }
            else if (res.status === 404) {
                console.log(res);
                toggleModal();
                loadingState = false;
                modalState.title = "Error";
                modalState.message = "เบอร์โทรศัพท์นี้ยังไม่ได้ลงทะเบียน";
            } 
            else {
                console.log(res);
                toggleModal();
                loadingState = false;
                modalState.title = "Error";
                modalState.message = "เกิดข้อผิดพลาดบางอย่าง ลองอีกครั้ง";
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
                <Modal
                    title={modalState.title}
                    open={modalState.open}
                    on:close={() => toggleModal()}
                >
                    <svelte:fragment slot="body">
                        {modalState.message}
                    </svelte:fragment>
                </Modal>
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
        <Loading />
    {/if}
</main>
