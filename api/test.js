// Semplice endpoint di test
module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'API di test funzionante',
    environment: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
}; 