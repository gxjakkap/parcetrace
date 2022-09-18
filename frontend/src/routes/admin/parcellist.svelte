<script lang="ts">
  import { browser } from "$app/env";
  import { API_KEY, API_URL } from "$lib/env";
  import { onMount } from "svelte";
  import Modal from "$lib/modal.svelte";
  import Loading from "$lib/loading.svelte";
  import StatusPage from "$lib/statuspage.svelte";
  import { Available, Lost, Found } from "$lib/parcelStatus/main";

  let apiKey: string;
  let apiUrl: string;
  //check for environment and set api key and url
  if (process.env.NODE_ENV === "production") {
    apiKey = process.env.API_KEY as string;
    apiUrl = process.env.API_URL as string;
  } else {
    apiKey = API_KEY;
    apiUrl = API_URL;
  }

  onMount(() => {
    if (browser) {
      let ss = localStorage.getItem("ptracecr");
      const savedSession = JSON.parse(ss as string);
      const lastLogin = Number(savedSession.user.lastLoginAt);
      const now = Date.now();
      const diff = now - lastLogin;
      if (!ss || diff > 60 * 60 * 24 * 7) {
        location.replace("/admin");
      }
    }
  });

  async function getData() {
    return fetch(`https://${apiUrl}/allparcellist`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: apiKey,
      },
    });
  }

  function waitforData(): Promise<any> {
    return new Promise((resolve, reject) => {
      /* getData().then((res) => {
        if (res.status === 200) {
          res.json().then((data) => {
            resolve(data);
          });
        } else {
          reject(res.status);
        }
      }); */
      getData()
        .then((res) => {
          if (res.status === 200) {
            res.json().then((data) => {
              resolve(data);
            });
          } else {
            reject(res.status);
          }
        })
        .catch((err) => {
          console.log(err);
          reject(500);
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

  const stringShorten = (str: string) => {
    let ans = str;
    if (str.length > 5) {
      ans = `${ans.substring(0, 4)}...`;
    }
    return ans;
  };
</script>

<main>
  {#await waitforData()}
    <Loading />
  {:then data}
    {#if data.length >= 1}
      <h1
        class="font-Prompt text-black dark:text-white text-center text-4xl mb-1 mt-5"
      >
        พัสดุในระบบ
      </h1>
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg ml-3 mr-3">
        <table
          class="w-full text-sm text-left text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="font-Prompt px-6 py-3"> วันที่ </th>
              <th scope="col" class="font-Prompt px-6 py-3"> เจ้าของ </th>
              <th scope="col" class="font-Prompt px-6 py-3">
                สถานะ / จุดรับ
              </th>
              <th scope="col" class="font-Prompt px-6 py-3">
                actionPlaceholder
              </th>
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
                  {stringShorten(d.userId)}
                </td>
                {#if d.status === "available"}
                  <Available location={d.location} />
                {:else if d.status === "found"}
                  <Found />
                {:else}
                  <Lost />
                {/if}
                <td
                  class="font-Prompt text-gray-900 dark:text-white hover:text-blue-500 underline px-6 py-4"
                >
                  <!-- <a
                    href={`https://parcetrace.vercel.app/confirmation?pid=${d.parcelId}`}
                    rel="noreferer"
                    target="_blank">ยืนยันการรับ</a
                  > -->
                  <p>actionPlaceholder</p>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <StatusPage message="ไม่พบพัสดุคงค้างในระบบ" />
    {/if}
  {/await}
</main>
