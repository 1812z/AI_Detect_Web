const BASE_URL_KEY = 'api_base_url'
const DEFAULT_BASE_URL = 'http://localhost:8080'

export function getBaseUrl() {
  return localStorage.getItem(BASE_URL_KEY) || DEFAULT_BASE_URL
}

export function setBaseUrl(url) {
  localStorage.setItem(BASE_URL_KEY, url)
}

export function removeBaseUrl() {
  localStorage.removeItem(BASE_URL_KEY)
}
