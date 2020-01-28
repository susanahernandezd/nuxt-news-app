<template>
  <div class="md-layout md-layout--main md-alignment-center">
    <!-- Top Navigation -->
    <md-toolbar class="fixed-toolbar" elevation="1">
      <md-button @click="showLeftSidepanel = true" class="md-icon-button">
        <md-icon>menu</md-icon>
      </md-button>
      <nuxt-link class="md-primary md-title" to="/">
        Nuxt News
      </nuxt-link>

      <div class="md-toolbar-section-end">
        <md-button to="/login">Login</md-button>
        <md-button to="/register">Register</md-button>
        <md-button class="md-accent" @click="showRightSidepanel = true">Categories</md-button>
      </div>
    </md-toolbar>

    <!-- Personal News Feed (Left Drawer) -->
    <md-drawer md-fixed :md-active.sync="showLeftSidepanel">
      <md-toolbar md-elevation="1">
        <span class="md-title">Personal Feed</span>
      </md-toolbar>

      <md-progress-bar v-if="loading" md-mode="indeterminate"></md-progress-bar>

      <md-content class="p-1">
        <md-field>
          <label for="country">Country</label>
          <md-select 
            @input="changeCountry" 
            :value="country"
            name="country" id="country">
            <md-option v-for="countryItem in countryList" :key="countryItem.countryCode" :value="countryItem.code">{{countryItem.name}}</md-option>
          </md-select>
        </md-field>
      </md-content>
    </md-drawer>

    <!-- News Categories (Right Drawer) -->
    <md-drawer :md-active.sync="showRightSidepanel" class="md-right" md-fixed>
      <md-toolbar :md-elevation="1">
        <span class="md-title">News Categories</span>
      </md-toolbar>

      <md-progress-bar v-if="loading" md-mode="indeterminate"/>
    
      <md-list>
        <md-subheader class="md-primary">Categories</md-subheader>

        <md-list-item v-for="(newsCategory, i) in newsCategories" 
          :key="i" 
          @click="loadCategory(newsCategory.category)">
          <md-icon :class="newsCategory.category === category ? 'md-primary' : ''">{{ newsCategory.icon }}</md-icon>
          <span class="md-list-item-text">{{ newsCategory.name }}</span>
        </md-list-item>
      </md-list>
    </md-drawer>

    <!-- App Content -->
    <div class="md-layout-item md-size-95">
      <md-content 
        class="md-layout md-gutter p-1" 
        style="background: #007998;">
        <ul 
          v-for="headline in headlines" 
          :key="headline.id" 
          class="md-layout-item md-large-size-25 md-medium-size-33 md-small-size-50 md-xsmall-size-100">
          <md-card 
            style="margin-top: 1em;" 
            md-with-hover>
            <md-ripple>
              <md-card-media md-ratio="16:9">
                <img 
                  :src="headline.urlToImage" 
                  :alt="headline.title">
              </md-card-media>

              <md-card-header>
                <div class="md-title">
                  <a :href="headline.url" 
                    target="_blank">{{ headline.title }}</a>
                </div>
                <div>
                  {{ headline.source.name }}
                  <md-icon class="small-icon">book</md-icon>
                </div>
                <div class="md-subhead"
                  v-if="headline.author">
                  {{ headline.author }}
                  <md-icon class="small-icon">face</md-icon>
                </div>
                <div class="md-subhead">
                  {{ headline.publishedAt }}
                  <md-icon class="small-icon">alarm</md-icon>
                </div>
              </md-card-header>

              <md-card-content>{{ headline.description }}</md-card-content>

              <md-card-actions>
                <md-button class="md-icon-button">
                  <md-icon>bookmark</md-icon>
                </md-button>
                <md-button class="md-icon-button">
                  <md-icon>message</md-icon>
                </md-button>
              </md-card-actions>
            </md-ripple>
          </md-card>
        </ul>
      </md-content>
    </div>
  </div>
</template>

<script>
  export default {
    data: () => ({
      showLeftSidepanel: false,
      showRightSidepanel: false,
      countryList: [
        { name: 'United States', code: 'us'},
        { name: 'Germany', code: 'de'},
        { name: 'France', code: 'fr'},
      ],
      newsCategories: [
        { name: 'Top Headlines', category: '', icon: 'today' },
        { name: 'Technology', category: 'technology', icon: 'keyboard' },
        { name: 'Business', category: 'business', icon: 'business_center' },
        { name: 'Entertainment', category: 'entertainment', icon: 'weekend' },
        { name: 'Health', category: 'health', icon: 'fastfood' },
        { name: 'Science', category: 'science', icon: 'fingerprint' },
        { name: 'Sports', category: 'sports', icon: 'golf_course' }
      ]
    }),
    async fetch({ store }) {
      const apiData = {
        country: store.state.country,
        category: store.state.category
      }
      await store.dispatch('loadHeadlines', apiData)
    },
    computed: {
      headlines() {
      return this.$store.getters.headlines;
      },
      category() {
        return this.$store.getters.category;
      },
      country() {
        return this.$store.getters.country;
      },
      loading() {
        return this.$store.getters.loading;
      }
    },
    methods: {
      loadCategory(category) {
        this.$store.commit('setCategory', category);
        this.loadHeadlines()
      },
      changeCountry(country) {
        this.$store.commit("setCountry", country);
        this.loadHeadlines()
      },
      async loadHeadlines() {
        const apiData = {
          country: this.country,
          category: this.category
        }
        await this.$store.dispatch('loadHeadlines', apiData)
      }
    }
  }
</script>

<style scoped lang="scss">
  .small-icon {
    font-size: 18px !important;
  }
  
  .fixed-toolbar {
    position: fixed;
    top: 0;
    z-index: 5;
  }

  .md-layout {

    &--main {
      margin: 4em 0
    }
  }

  .p-1 {
    padding: 1em;
  }
</style>