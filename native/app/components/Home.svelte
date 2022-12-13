<page>
    <stackLayout>
        <label class="text-3xl text-center my-5">Parcetrace Admin</label>
        <stackLayout class="grid grid-cols-1">
            <button>เพิ่มพัสดุ</button>
            <button>ตรวจสอบพัสดุ</button>
            <button on:tap={() => {logout()}}>ออกจากระบบ</button>
        </stackLayout>
    </stackLayout>
</page>
 
<script lang="ts">
    import { ApplicationSettings, Http } from "@nativescript/core";
    import { navigate } from "svelte-native";
    import Welcome from "./Welcome.svelte";
    import { LoadingIndicator } from "@nstudio/nativescript-loading-indicator"
    import { Feedback } from "nativescript-feedback"
    import { loadingModalOptions } from "../utils/options"

    const loadingModal = new LoadingIndicator()
    const feedback = new Feedback()


    const logout = () => {
        loadingModal.show(loadingModalOptions)
        const body = JSON.stringify({ sessionid: ApplicationSettings.getString('sessionid') })
        Http.request({
            method: 'POST',
            url: 'https://api.guntxjakka.me/adminapp/logout',
            headers: { "Content-Type": "application/json" },
            content: body
        }).then(res => {
            if (res.statusCode === 200){
                loadingModal.hide()
                ApplicationSettings.remove('session')
                ApplicationSettings.remove('sessionid')
                feedback.success({message: "ออกจากระบบสำเร็จ"})
                navigate({page: Welcome})
            }
            else {
                feedback.error({message: "Logout failed!"})
                return
            }
        })
    }
</script>
 
  