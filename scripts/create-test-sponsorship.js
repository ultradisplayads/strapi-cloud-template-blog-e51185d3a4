const axios = require('axios');

async function createTestSponsorship() {
  try {
    const response = await axios.post('https://api.pattaya1.com/api/global-sponsorships', {
      data: {
        title: "Sponsored by Singha Beer",
        isActive: true,
        sponsoredWidgets: ["radio"],
        sponsorColor: "#1e40af"
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Test sponsorship created:', response.data);
  } catch (error) {
    console.error('Error creating test sponsorship:', error.response?.data || error.message);
  }
}

createTestSponsorship();
