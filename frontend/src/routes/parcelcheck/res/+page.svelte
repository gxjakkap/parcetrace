<script lang="ts">
  import { page } from "$app/stores";
  import Loading from "$lib/loading.svelte";
  import Statuspage from "$lib/statuspage.svelte";
  import { API_KEY, API_URL } from "$lib/env";
  import { Available, Lost, Found } from "$lib/parcelStatus/main";

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
    date: Date;
    sender: string;
    location: string;
    status: "available" | "lost" | "found";
    parcelId: string;
  }

  interface userData {
    name: string;
    surname: string;
  }

  interface lineData {
    displayName: string;
    picLink: string;
  }

  interface responsedata {
    status: number;
    parcels: parcels[];
    userData: userData;
    lineData: lineData;
  }

  //get userId params from url (https://domain.ext/parcecheck?userId="userId")
  let userId: string | null = $page.url.searchParams.get("userId") || null;

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
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const openInNewTab = (url: string) => {
    window.open(url)
  }
</script>

<svelte:head>
  <title>Parcel Check - Parcetrace</title>
</svelte:head>

<main>
  {#await waitforData()}
    <Loading />
  {:then data}
    {#if data.parcels.length >= 1}
      <h1
        class="font-Prompt text-black dark:text-white text-center text-4xl mb-1 mt-5"
      >
        พัสดุของคุณ
      </h1>
      <h3
        class="font-Prompt text-black dark:text-white text-center text-2xl pb-3 mb-5 mt-3"
      >
        {`${data.userData.name} ${data.userData.surname} (${data.lineData.displayName})`}
      </h3>
      <div
        class="relative overflow-x-auto shadow-md sm:rounded-lg ml-3 mr-3 lg:ml-10 lg:mr-10"
      >
        <table
          class="w-full text-sm text-left text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="font-Prompt px-6 py-3"> วันที่ </th>
              <th scope="col" class="font-Prompt px-6 py-3"> พัสดุจาก </th>
              <th scope="col" class="font-Prompt px-6 py-3">
                สถานะ / จุดรับ
              </th>
              <th scope="col" class="font-Prompt px-6 py-3"> ยืนยัน </th>
            </tr>
          </thead>
          <tbody>
            {#each data.parcels as d}
              <tr
                class="bg-white border-b dark:bg-gray-700 dark:border-gray-700"
              >
                <th
                  scope="row"
                  class="font-Prompt px-4 py-4 font-medium text-gray-900 dark:text-white whitespace-pre-wrap break-normal"
                >
                  {localeDateString(d.date)}
                </th>
                <td class="font-Prompt text-gray-900 dark:text-white px-6 py-4">
                  {d.sender}
                </td>
                {#if d.status === "available"}
                  <Available location={d.location} />
                {:else if d.status === "found"}
                  <Found />
                {:else}
                  <Lost />
                {/if}
                <td
                  class="font-Prompt text-gray-900 dark:text-white  underline px-6 py-4"
                >
                  <!-- <a
                    href={`https://parcetrace.vercel.app/confirmation?pid=${d.parcelId}`}
                    rel="noreferrer"
                    target="_blank">ยืนยันการรับ</a
                  > -->
                  <button class="bg-green-600 rounded-md p-2" on:click={() => {openInNewTab(`https://parcetrace.vercel.app/confirmation?pid=${d.parcelId}`)}}>ยืนยันการรับ</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <Statuspage message="คุณไม่มีพัสดุในระบบ" />
    {/if}
  {/await}
</main>
