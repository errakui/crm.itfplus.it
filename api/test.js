// API di test per verificare che le API funzionino correttamente
module.exports = (req, res) => {
  res.status(200).json({
    message: 'ITFPLUS API funzionante!',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
}; 