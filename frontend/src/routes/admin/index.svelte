<script lang="ts">
  
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  import { initializeApp } from "firebase/app";
  import { FIREBASE_CONFIG } from "$lib/env";
  import { onMount } from "svelte";
  import Modal from "$lib/modal.svelte";

  interface credentials {
    email: string;
    password: string;
  }

  interface firebaseConfig {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  }

  let firebaseConfig: firebaseConfig = {};

  //check for environment and set api key and url
  if (process.env.NODE_ENV === "production") {
    firebaseConfig.apiKey = process.env.FIREBASE_APIKEY as string;
    firebaseConfig.authDomain = process.env.FIREBASE_AUTHDOMAIN as string;
    firebaseConfig.projectId = process.env.FIREBASE_PRJID as string;
    firebaseConfig.storageBucket = process.env.FIREBASE_STRGEBKT as string;
    firebaseConfig.messagingSenderId = process.env.FIREBASE_MSGID as string;
    firebaseConfig.appId = process.env.FIREBASE_APPID as string;
  } else {
    firebaseConfig = FIREBASE_CONFIG;
  }

  const credentials: credentials = { email: "", password: "" };
  let auth: any;
  let app: any;
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch {
    auth = getAuth();
  }

  let modalState = {
    open: false,
    title: "defaultTitle",
    message: "defaultMessage",
  };

  const toggleModal = () => {
    modalState.open = !modalState.open;
  };

  const firebaseErrorMap: any = {
    "auth/user-not-found": "User Not Found!",
    "auth/wrong-password": "Wrong Email/Password",
  };

  onMount(() => {
    //if (browser) {
    let ss = localStorage.getItem("ptracecr");
    const savedSession = JSON.parse(ss as string);
    const lastLogin = Number(savedSession.user.lastLoginAt);
    const now = Date.now();
    const diff = now - lastLogin;
    if (ss && diff < 60 * 60 * 24 * 7) {
      location.replace("/admin/parcellist");
    }
    //}
  });

  async function onSubmit() {
    if (!credentials.email || !credentials.password) {
      toggleModal();
      modalState.title = "Error";
      modalState.message = "กรุณากรอกข้อมูลให้ครบถ้วน";
      return;
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(credentials.email)) {
      toggleModal();
      modalState.title = "Error";
      modalState.message = "อีเมลไม่ถูกต้อง";
      return;
    }

    signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      .then((userCred) => {
        //TODO: implement login success
        localStorage.setItem("ptracecr", JSON.stringify(userCred));
        location.replace("/admin/parcellist");
        console.log(userCred);
      })
      .catch((error) => {
        toggleModal();

        modalState.title = "Error";
        modalState.message =
          firebaseErrorMap[error.code] || `${error.code} ${error.message}`;
        return;
      });
  }
</script>

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
        ลงชื่อเข้าใช้สู่ Admin Panel
      </h1>

      <input
        type="text"
        class="font-Prompt block border border-gray-400 dark:border-gray-700 text-black dark:text-white w-full p-3 rounded mb-4 bg-white dark:bg-slate-500"
        placeholder="example@parcetrace.app"
        bind:value={credentials.email}
      />

      <input
        type="password"
        class="font-Prompt block border border-gray-400 dark:border-gray-700 text-black dark:text-white w-full p-3 rounded mb-4 bg-white dark:bg-slate-500"
        placeholder="Password"
        bind:value={credentials.password}
      />

      <button
        type="submit"
        class="font-Prompt w-full text-center py-3 rounded bg-green-500 text-white hover:bg-green-700 focus:outline-none my-1"
        on:click={onSubmit}>Login</button
      >
      <h3
        class="font-Prompt text-black dark:text-white hover:text-blue-500 underline text-center text-lg mt-3"
      >
        <a href={"/admin/resetpassword"}>ลืมรหัสผ่าน?</a>
      </h3>
    </div>
  </div>
</div>
