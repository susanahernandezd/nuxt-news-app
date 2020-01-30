import qs from 'qs'

export function addQueryParams (url, data) {
  return url + qs.stringify(data, { addQueryPrefix: true, arrayFormat: 'brackets' })
}