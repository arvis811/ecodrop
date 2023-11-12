module.exports.index = async (req, res) => {
  try {
    const disposePage = 'Dispose Page';
    res.render('dispose/index', { disposePage });
  } catch (err) {
    console.error(err.message);
  }
};
