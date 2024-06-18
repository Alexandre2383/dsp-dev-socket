const requestGranted = 200

const middle = (req, res, next) => {
  if (requestGranted == 200) {
    return res.json({
      is: 'validate',
    })
  }
  next()
}

module.exports = middle
