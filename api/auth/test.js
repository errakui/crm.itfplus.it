// Endpoint di test per verificare se le API auth funzionano
module.exports = (req, res) => {
  res.status(200).json({
    message: 'API Auth Test funzionante',
    method: req.method,
    path: req.url,
    query: req.query,
    time: new Date().toISOString()
  });
}; 