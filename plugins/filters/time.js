import Vue from "vue";
import { formatDistanceToNow } from "date-fns";

Vue.filter("publishedTimeToNow", time => {
  return `${formatDistanceToNow(new Date(time))} ago`;
});

Vue.filter("commentTimeToNow", timestamp => {
  const timeElapsed = formatDistanceToNow(new Date(timestamp), {
    includeSeconds: true
  });
  return `${timeElapsed} ago`;
});
