import Vuex from 'vuex';
import md5 from 'md5';
import db from '~/plugins/firestore';
import { saveUserData, clearUserData } from "~/utils/auth";

const DEFAULT_ERROR_MESSAGE = 'There was an error, please try it later'

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
      },
      clearToken: state => {
        state.token = ""
      },
      clearUser: state => {
        state.user = null
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
          const authUserData = await this.$axios.$post(
            `/${userPayload.action}/`,
            {
              email: userPayload.email,
              password: userPayload.password,
              returnSecureToken: userPayload.returnSecureToken
            }
          );
          let user;
          if (userPayload.action === "register") {
            const avatar = `http://gravatar.com/avatar/${md5(
              authUserData.email
            )}?d=identicon`;
            user = { email: authUserData.email, avatar };
            await db
              .collection("users")
              .doc(userPayload.email)
              .set(user);
          } else {
            const loginRef = db.collection("users").doc(userPayload.email);
            const loggedInUser = await loginRef.get();
            user = loggedInUser.data();
          }
          commit("setUser", user);
          commit("setToken", authUserData.idToken);
          saveUserData(authUserData, user);
        } catch (err) {
          commit("error", err);
        } finally {
          commit("setLoading", false);

        }
      },
      setLogoutTimer({ dispatch }, interval) {
        setTimeout(() => dispatch("logoutUser"), interval);
      },
      logoutUser({ commit }) {
        commit("clearToken");
        commit("clearUser");
        clearUserData();
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
        const { response: { data: { error: { message = DEFAULT_ERROR_MESSAGE } = {} } = {} } = {} } = error
        return message
      }
    }
  })
}