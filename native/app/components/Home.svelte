<page>
    <stackLayout>
        <label class="text-3xl text-center my-5">Parcetrace Admin</label>
        <stackLayout class="grid grid-cols-1">
            <button on:tap={() => {capture()}}>เพิ่มพัสดุ</button>
            <button>ตรวจสอบพัสดุ</button>
            <button on:tap={() => {check()}}>Check</button>
            <button on:tap={() => {logout()}}>ออกจากระบบ</button>
        </stackLayout>
    </stackLayout>
</page>
 
<script lang="ts">
    import { ApplicationSettings, Http, Image, ImageSource } from "@nativescript/core"
    import { navigate } from "svelte-native"
    import { LoadingIndicator } from "@nstudio/nativescript-loading-indicator"
    import { Feedback } from "nativescript-feedback"
    import * as camera from "@nativescript/camera"
    import { loadingModalOptions } from "../utils/options"
    import { check } from "../utils/debugutils"
    import Welcome from "./Welcome.svelte"
    import DataSelect from "./DataSelect.svelte";

    const loadingModal = new LoadingIndicator()
    const feedback = new Feedback()


    const logout = async() => {
        loadingModal.show(loadingModalOptions)
        const body = JSON.stringify({ sessionid: ApplicationSettings.getString('sessionid') })
        const postRes = await Http.request({
            method: 'POST',
            url: 'https://api.guntxjakka.me/adminapp/logout',
            headers: { "Content-Type": "application/json" },
            content: body
        })
        if (postRes.statusCode !== 200){
            feedback.error({message: `Logout failed! (${postRes.content?.toJSON().message})`})
            return
        }
        loadingModal.hide()
        ApplicationSettings.remove('session')
        ApplicationSettings.remove('sessionid')
        feedback.success({message: "ออกจากระบบสำเร็จ"})
        navigate({page: Welcome})
    }

    const capture = async() => {
        /* camera.requestPermissions().then(
            async function success() {
                const picTaken = await camera.takePicture()
                console.log(picTaken)
                let img = new Image()
                img.src = picTaken
                console.log(img)
                navigate({ page: DataSelect, props: { img: ImageSource.fromAsset } })
            },
            function failure() {
                feedback.error({ message: "Insufficient Permission for Camera!" })
            }
        ) */
    }
</script>
 
  