import firebase from 'firebase/app';
import 'firebase/firestore';

if (!firebase.apps.length) {
  var config = {
    apiKey: "AIzaSyDbPrkcSaOcLiV88WAbDXVrqksnhySS2BA",
    authDomain: "nuxt-news-feed-3fc9d.firebaseapp.com",
    databaseURL: "https://nuxt-news-feed-3fc9d.firebaseio.com",
    projectId: "nuxt-news-feed-3fc9d",
    storageBucket: "nuxt-news-feed-3fc9d.appspot.com",
    messagingSenderId: "340865900697",
    appId: "1:340865900697:web:5c441e207b480a184ad808"
  };
  firebase.initializeApp(config);
  firebase.firestore().settings({
    timestampsInSnapshots: true
  });
}

const db = firebase.firestore();

export default db;
