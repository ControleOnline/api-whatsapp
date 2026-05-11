const slugfy = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/[àÀáÁâÂãäÄÅåª]+/g, 'a') // Special Characters #1
    .replace(/[èÈéÉêÊëË]+/g, 'e') // Special Characters #2
    .replace(/[ìÌíÍîÎïÏ]+/g, 'i') // Special Characters #3
    .replace(/[òÒóÓôÔõÕöÖº]+/g, 'o') // Special Characters #4
    .replace(/[ùÙúÚûÛüÜ]+/g, 'u') // Special Characters #5
    .replace(/[ýÝÿŸ]+/g, 'y') // Special Characters #6
    .replace(/[ñÑ]+/g, 'n') // Special Characters #7
    .replace(/[çÇ]+/g, 'c') // Special Characters #8
    .replace(/[ß]+/g, 'ss') // Special Characters #9
    .replace(/[Ææ]+/g, 'ae') // Special Characters #10
    .replace(/[Øøœ]+/g, 'oe') // Special Characters #11
    .replace(/[%]+/g, 'pct') // Special Characters #12
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

module.exports = slugfy
