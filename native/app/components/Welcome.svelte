<page>
    <rootLayout width="100%" height="100%">
         <stackLayout height="100%">
             <label class="text-3xl text-center my-3">Parcetrace Admin</label>
             <label class="text-sm text-center mb-5 break-words">Please enter Parcetrace's admin master password.</label>
             <textField bind:text={value} secure={true} />
             <button on:tap={() => {validate()}}>Submit</button>
             <button on:tap={() => {check()}}>Check</button>
         </stackLayout>
    </rootLayout>
</page>

<script lang="ts">
    import { Http, ApplicationSettings } from '@nativescript/core'
    import { navigate } from 'svelte-native'
    import { onMount } from 'svelte'
    import { LoadingIndicator } from "@nstudio/nativescript-loading-indicator"
    import { Feedback } from "nativescript-feedback"
    import { DeviceInfo } from "nativescript-dna-deviceinfo";
    import { loadingModalOptions } from "../utils/options"
    import { check } from "../utils/debugutils"
    import Home from './Home.svelte'

    const loadingModal = new LoadingIndicator()
    const feedback = new Feedback()

    onMount(() => {
        if (ApplicationSettings.getBoolean('session')){
            navigate({ page: Home })
        }
    })

    let value = ""

    const validate = async() => {
        const userAgent = await DeviceInfo.userAgent()        
        const body = JSON.stringify({ password: value, userAgent: userAgent })
        loadingModal.show(loadingModalOptions)
        const postRes = await Http.request({
            method: 'POST',
            url: 'https://api.guntxjakka.me/adminapp/authen',
            headers: { "Content-Type": "application/json" },
            content: body
        })

        if (!postRes.content?.toJSON().sessionid){
            loadingModal.hide()
            feedback.error({ message: `ERR: Rejected by server. (${postRes.content?.toJSON().message})`})
            return
        }

        ApplicationSettings.setBoolean('session', true)
        ApplicationSettings.setString('sessionid', postRes.content?.toJSON().sessionid)
        loadingModal.hide()
        feedback.success({ message: "ลงทะเบียนสำเร็จ!"})
        navigate({ page: Home })
    }    
</script>

