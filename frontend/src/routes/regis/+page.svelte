<script lang="ts">
  import { page } from "$app/stores";
  import { API_KEY, API_URL } from "$lib/env";
  import Modal from "$lib/modal.svelte";
  import Statuspage from "$lib/statuspage.svelte";

  //check for environment and set api key and url
  const apikey =
    process.env.NODE_ENV === "production" ? process.env.API_KEY : API_KEY;
  const apiUrl =
    process.env.NODE_ENV === "production" ? process.env.API_URL : API_URL;

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

  let modalState = {
    open: false,
    title: "defaultTitle",
    message: "defaultMessage",
  };

  const toggleModal = () => {
    modalState.open = !modalState.open;
  };

  //post data to api on button click
  async function onSubmit() {
    if (
      !userData.name ||
      !userData.surname ||
      !userData.room ||
      !userData.phoneNumber
    ) {
      toggleModal();
      modalState.title = "Error";
      modalState.message = "กรุณากรอกข้อมูลให้ครบถ้วน";
      return;
    }
    if (
      !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
        userData.phoneNumber
      )
    ) {
      toggleModal();
      modalState.title = "Error";
      modalState.message = "เบอร์โทรศัพท์ไม่ถูกต้อง";
      return;
    }
    fetch(`https://${apiUrl}/userreg`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        authorization: apikey as string,
      },
      body: JSON.stringify(userData),
    })
      .then((res) => {
        if (res.status === 200) {
          location.replace("/regis/success");
        } else if (res.status === 500) {
          toggleModal();
          modalState.title = "Error";
          modalState.message =
            "เกิดข้อผิดพลาดขึ้นกับเซิร์ฟเวอร์ลงทะเบียน โปรดลองใหม่อีกครั้ง";
        } else if (res.status === 403) {
          toggleModal();
          modalState.title = "Error";
          modalState.message =
            "คุณยังไม่ได้เป็นเพื่อนกับบอท Parcetrace หรือคุณได้ลงทะเบียนไปแล้ว";
        } else {
          toggleModal();
          modalState.title = "Error";
          modalState.message = "มีข้อผิดพลาดบางอย่าง";
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
          class="g-white dark:bg-gray-700 px-6 py-8 rounded shadow-md text-black w-full"
        >
          <h1
            class="font-Prompt mb-8 text-3xl text-center text-black dark:text-white"
          >
            ลงทะเบียน
          </h1>
          <!-- <input
                        type="text"
                        readonly
                        class="font-Prompt block border border-gray-400 dark:border-gray-700 text-black dark:text-white w-full p-3 rounded mb-4 bg-white dark:bg-slate-500 cursor-not-allowed"
                        bind:value={userId}
                    /> -->

          <input
            type="text"
            class="font-Prompt block border border-gray-400 dark:border-gray-700 text-black dark:text-white w-full p-3 rounded mb-4 bg-white dark:bg-slate-500"
            placeholder="ชื่อจริง"
            bind:value={userData.name}
          />

          <input
            type="text"
            class="font-Prompt block border border-gray-400 dark:border-gray-700 text-black dark:text-white w-full p-3 rounded mb-4 bg-white dark:bg-slate-500"
            placeholder="นามสกุล"
            bind:value={userData.surname}
          />

          <input
            type="text"
            class="font-Prompt block border border-gray-400 dark:border-gray-700 text-black dark:text-white w-full p-3 rounded mb-4 bg-white dark:bg-slate-500"
            placeholder="เลขห้อง"
            bind:value={userData.room}
          />

          <input
            type="tel"
            class="font-Prompt block border border-gray-400 dark:border-gray-700 text-black dark:text-white w-full p-3 rounded mb-4 bg-white dark:bg-slate-500"
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
    <Statuspage message="Error: userId is missing or invalid">
      <svelte:fragment slot="body">
        <p class="text-center">
          Click <a href="/" class="text-blue-700 underline hover:text-sky-500"
            >here</a
          > to go back home.
        </p>
      </svelte:fragment>
    </Statuspage>
  {/if}
</main>
