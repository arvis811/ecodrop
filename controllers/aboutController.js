module.exports.index = async (req, res) => {
  try {
    const aboutPage = 'About Page';
    res.render('about/index', { aboutPage });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports.contacts = async (req, res) => {
  try {
    const aboutPage = 'Contacts Page';
    res.render('about/contacts', { aboutPage });
  } catch (err) {
    console.error(err.message);
  }
};
