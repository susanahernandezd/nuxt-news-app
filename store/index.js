import Vuex from 'vuex';
import md5 from 'md5';

export default () => {
  return new Vuex.Store({
    state: {
      headlines: [],
      loading: false,
      token: "",
      user: null,
      category: '',
      country: 'us',
      error: null
    },
    mutations: {
      setHeadlines(state, headlines) {
        state.headlines = headlines;
      },
      setLoading(state, loading) {
        state.loading = loading;
      },
      setToken(state, token) {
        state.token = token;
      },
      setUser(state, user) {
        state.user = user;
      },
      setCategory(state, category) {
        state.category = category;
      },
      setCountry(state, country) {
        state.country = country;
      },
      error(state, error) {
        state.error = error
      }
    },
    actions: {
      async loadHeadlines({ commit, state }, { country, category } = {}) {
        commit('setLoading', true);
        const { articles } = await this.$axios.$get(`/api/top-headlines?country=${country}&category=${category}`);
        commit('setLoading', false);
        commit("setHeadlines", articles);
      },
      async authenticateUser({ commit }, userPayload) {
        try {
          commit("setLoading", true);
          commit("error", null);
          const authUserData = await this.$axios.$post(
            "/register/",
            userPayload
          );
          const avatar = `http://gravatar.com/avatar/${md5(authUserData.email)}?d=identicon`;
          const user = { email: authUserData.email, avatar };
          commit("setUser", user);
          commit("setToken", authUserData.idToken);
        } catch (err) {
          commit("error", err);
        } finally {
          commit("setLoading", false);
        }
      }
    },
    getters: {
      headlines: ({ headlines }) => headlines,
      loading: ({ loading }) => loading,
      user: ({ user }) => user,
      isAuthenticated: ({ token }) => !!token,
      category: ({ category }) => category,
      country: ({ country }) => country,
      error: ({ error = null }) => {
        if(!error) {
          return
        }
        const DEFAULT_ERROR_MESSAGE = 'There was an error, please try it later'
        console.log('DINS:', error)
        const { response: { data: { error: { message = DEFAULT_ERROR_MESSAGE } = {} } = {} } = {} } = error
        return message
      }
    }
  })
}