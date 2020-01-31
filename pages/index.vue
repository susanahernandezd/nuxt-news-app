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
        <template v-if="isAuthenticated">
          <md-button>
            <md-avatar><img :src="user.avatar" :alt="user.email"></md-avatar>
              {{user.email}}
          </md-button>
          <md-button @click="logoutUser">Logout</md-button>
        </template>

        <template v-else>
          <md-button to="/login">Login</md-button>
          <md-button to="/register">Register</md-button>
        </template>
        <md-button class="md-primary" @click="showSearchDialog = true">Search</md-button>
        <md-button class="md-accent" @click="showRightSidepanel = true">Categories</md-button>
      </div>
    </md-toolbar>

    <!-- Search Dialog -->
    <md-dialog :md-active.sync="showSearchDialog">
      <md-dialog-title>Search Headlines</md-dialog-title>

      <div class="md-layout" style="padding: 1em">
        <md-field>
          <label>Search Term(s)</label>
          <md-input v-model="search.query" placeholder="Use quotes for exact matches, AND / OR / NOT for multiple terms" maxlength="30"></md-input>
        </md-field>
        <md-datepicker v-model="search.fromDate" md-immediately><label>Select starting date (optional)</label></md-datepicker>
        <md-datepicker v-model="search.toDate" md-immediately><label>Select ending date (optional)</label></md-datepicker>
        <md-field>
          <label for="sortBy">Sort search results by criteria (optional)</label>
          <md-select v-model="search.sortBy" name="sortBy" id="sortBy" md-dense>
            <md-option value="publishedAt">Newest (default)</md-option>
            <md-option value="relevancy">Relevant</md-option>
            <md-option value="popularity">Popular</md-option>
          </md-select>
        </md-field>
      </div>

      <md-dialog-actions>
        <md-button class="md-accent" @click="showSearchDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="searchHeadlines">Search</md-button>
      </md-dialog-actions>
    </md-dialog>

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

      <!-- Default Markup (if Feed Empty) -->
      <md-empty-state class="md-primary" v-if="feed.length === 0 && !user" md-icon="bookmarks" md-label="Nothing in Feed" md-description="Login to bookmark headlines">
        <md-button to='/login' class="md-primary md-raised">Login</md-button>
      </md-empty-state>

      <md-empty-state v-else-if="feed.length === 0" class="md-accent" md-icon="bookmark_outline" md-label="Nothing in Feed" md-description="Anything you bookmark will be safely stored here"></md-empty-state>

      <!-- Feed Content (if Feed Not Empty) -->
      <md-list class="md-triple-line" v-for="headline in feed" :key="headline.id">
        <md-list-item>
          <md-avatar><img :src="headline.urlToImage" :alt="headline.title"></md-avatar>

            <div class="md-list-item-text">
              <span><a :href="headline.url" target="_blank">{{headline.title}}</a></span>
              <span>{{headline.source.name}}</span>
              <span @click="saveHeadline(headline)">View Comments</span>
            </div>

            <md-button @click="removeHeadlineFromFeed(headline)" class="md-icon-button md-list-action">
              <md-icon class="md-accent">delete</md-icon>
            </md-button>
        </md-list-item>
        <md-divider class="md-inset"></md-divider>
      </md-list>
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
                <img :src="headline.urlToImage" :alt="headline.title">
              </md-card-media>

              <md-card-header>
                <div class="md-title">
                  <a :href="headline.url" target="_blank">{{headline.title}}</a>
                </div>
                <div v-if="headline.source.id" @click="loadSource(headline.source.id)">
                  {{headline.source.name}}
                  <md-icon class="small-icon">book</md-icon>
                </div>
                <div class="md-subhead" v-if="headline.author">
                  {{headline.author}}
                  <md-icon class="small-icon">face</md-icon>
                </div>
                <div class="md-subhead">
                  {{headline.publishedAt | publishedTimeToNow}}
                  <md-icon class="small-icon">alarm</md-icon>
                </div>
              </md-card-header>

              <md-card-content>{{ headline.description }}</md-card-content>

              <md-card-actions>
                <md-button
                   v-if="isAuthenticated"
                   @click="addHeadlineToFeed(headline)" 
                   class="md-icon-button" 
                   :class="isInFeed(headline.title)">
                    <md-icon>bookmark</md-icon>
                  </md-button>
                <md-button @click="saveHeadline(headline)" class="md-icon-button">
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
import { addQueryParams } from '~/utils/url';

export default {
  data: () => ({
    showLeftSidepanel: false,
    showRightSidepanel: false,
    showSearchDialog: false,
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
    ],
    search: {
      query: '',
      fromDate: '',
      toDate: '',
      sortBy: ''
    }
  }),
  async fetch({ store }) {
    const url = addQueryParams('/api/top-headlines', {
      country: store.state.country,
      category: store.state.category
    });
    await store.dispatch('loadHeadlines', url)
    await store.dispatch("loadUserFeed");
  },
  computed: {
    headlines() {
      return this.$store.getters.headlines;
    },
    feed() {
      return this.$store.getters.feed;
    },
    category() {
      return this.$store.getters.category;
    },
    country() {
      return this.$store.getters.country;
    },
    source() {
      return this.$store.getters.source;
    },
    loading() {
      return this.$store.getters.loading;
    },
    user() {
      return this.$store.getters.user;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  methods: {
    loadCategory(category) {
      this.$store.commit('setCategory', category);
      this.loadTopHeadlines({
        country: this.country,
        category: this.category
      })
    },
    async loadSource(sourceId) {
      if (sourceId) {
        this.$store.commit('setSource', sourceId);
        this.loadTopHeadlines({
          sources: sourceId
        })
      }
    },
    async searchHeadlines() {
      const { query, fromDate, sortBy, toDate } = this.search;
      const params = {
        q: query,
        from: this.dateToISOString(fromDate),
        to: this.dateToISOString(toDate),
        sortBy
      }
      const url = addQueryParams('/api/everything', params);
      await this.$store.dispatch('loadHeadlines', url)

      this.showSearchDialog = false;
    },
    async saveHeadline(headline) {
      await this.$store.dispatch("saveHeadline", headline);
      this.$router.push(`/headlines/${headline.slug}`);
    },
    changeCountry(country) {
      this.$store.commit("setCountry", country);
      this.loadTopHeadlines({
        country: this.country,
        category: this.category
      })
    },
    async loadTopHeadlines(params = {}) {
      const url = addQueryParams('/api/top-headlines', params);
      await this.$store.dispatch('loadHeadlines', url)
    },
    async addHeadlineToFeed(headline) {
      if (this.user) {
        await this.$store.dispatch("addHeadlineToFeed", headline);
      }
    },
    async removeHeadlineFromFeed(headline) {
      await this.$store.dispatch('removeHeadlineFromFeed', headline);
    },
    logoutUser() {
      this.$store.dispatch("logoutUser");
    },
    isInFeed(title) {
      const inFeed =
        this.feed.findIndex(headline => headline.title === title) > -1;
      return inFeed ? "md-primary" : "";
    },
    dateToISOString(date) {
      if (date) {
        return new Date(date).toISOString();
      }
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