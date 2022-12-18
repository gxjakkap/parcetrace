<page>
    <stackLayout>
        <label class="text-sm" text={text}/>
        <img src={imageSrc} />
    </stackLayout>
</page>

<script lang="ts">
    /* import { firebase, mlkit } from "@nativescript/firebase"
    import { MLKitRecognizeTextResult } from "@nativescript/firebase/mlkit/textrecognition" */
    import { onMount } from "svelte";

    export let props
    let text: string = ""
    let imageSrc = props.img

    /* onMount(() => {
        firebase.init()
    })

    mlkit.textrecognition.recognizeTextOnDevice({ image: imageSrc })
        .then((result: MLKitRecognizeTextResult) => {
            text = result.text ? result.text : ""
        }) */

</script>