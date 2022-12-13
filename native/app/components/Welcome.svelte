<page>
    <rootLayout width="100%" height="100%">
         <stackLayout height="100%">
             <label class="text-3xl text-center my-5">Parcetrace Admin</label>
             <textField bind:text={value} secure={true} />
             <button on:tap={() => {validate()}}>Submit</button>
             <button on:tap={() => {checkSessionID()}}>Check</button>
         </stackLayout>
    </rootLayout>
</page>

<script lang="ts">
    import Home from './Home.svelte';
    import { Http, ApplicationSettings } from '@nativescript/core'
    import { navigate } from 'svelte-native';
    import { onMount } from 'svelte';
    import { LoadingIndicator } from "@nstudio/nativescript-loading-indicator"
    import { Feedback } from "nativescript-feedback"
    import { loadingModalOptions } from "../utils/options"

    const loadingModal = new LoadingIndicator()
    const feedback = new Feedback()

    onMount(() => {
        if (ApplicationSettings.getBoolean('session')){
            navigate({ page: Home })
        }
    })

    let value = ""

    const validate = () => {
        const body = JSON.stringify({ password: value })
        loadingModal.show(loadingModalOptions)
        Http.request({
            method: 'POST',
            url: 'https://api.guntxjakka.me/adminapp/authen',
            headers: { "Content-Type": "application/json" },
            content: body
        }).then(res => {
            if (res.content?.toJSON().sessionid){
                ApplicationSettings.setBoolean('session', true)
                ApplicationSettings.setString('sessionid', res.content?.toJSON().sessionid)
                loadingModal.hide()
                feedback.success({ message: "ลงทะเบียนสำเร็จ!"})
                navigate({ page: Home })
            }
            else {
                loadingModal.hide()
                feedback.error({ message: "Rejected by server."})
            }
        })
    }

    const checkSessionID = () => {
        console.log(ApplicationSettings.getString('sessionid'))
    }

    
</script>

