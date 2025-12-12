export function showMessage(message, type = 'success') {
  const div = document.createElement('div')
  div.className = `fixed top-4 right-4 px-6 py-3 rounded shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`
  div.textContent = message
  document.body.appendChild(div)

  setTimeout(() => {
    div.remove()
  }, 3000)
}

export function showSuccess(message) {
  showMessage(message, 'success')
}

export function showError(message) {
  showMessage(message, 'error')
}
