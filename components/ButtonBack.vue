<template>
  <md-button class="md-fixed md-fab-bottom-right md-fab md-primary" @click="$router.go(-1)">
    <md-icon>arrow_back</md-icon>
  </md-button>
</template>

<script>
export default {
  name: 'BackButton'
}
</script>
