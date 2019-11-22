module.exports = {
  isAnySubstring: (substrings, string) => {
    return substrings.some(substr => string.indexOf(substr) > -1)
  }
}
