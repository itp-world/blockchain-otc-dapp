<template>
  <v-layout row wrap>
    <v-flex md6>
      <euro-token-card/>
    </v-flex>

    <v-flex md6>
      <asset-token-card/>
    </v-flex>
  </v-layout>
</template>

<script>
import AssetTokenCard from '@/components/views/Token/AssetTokenCard'
import EuroTokenCard from '@/components/views/Token/EuroTokenCard'
export default {

  components: {
    'asset-token-card': AssetTokenCard,
    'euro-token-card': EuroTokenCard
  }

}
</script>
