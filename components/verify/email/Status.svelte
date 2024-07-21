<script>
    export let message, error;
</script>

<div>
    <div style="color:green">{ message ?? ''}</div>
    <div style="color:red">{ error ?? ''}</div>
</div>