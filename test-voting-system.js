const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testVotingSystem() {
  const baseUrl = 'https://api.pattaya1.com/api/breaking-news';
  
  console.log('🧪 Testing Voting System...\n');
  
  try {
    // 1. Get a breaking news article
    console.log('1. Fetching breaking news articles...');
    const newsResponse = await fetch(`${baseUrl}/live`);
    const newsData = await newsResponse.json();
    
    if (!newsData.data || newsData.data.length === 0) {
      console.log('❌ No breaking news articles found');
      return;
    }
    
    const article = newsData.data[0];
    const articleId = article.id || article.documentId;
    console.log(`✅ Found article: "${article.title}" (ID: ${articleId})`);
    console.log(`   Initial votes: 👍 ${article.upvotes || 0} 👎 ${article.downvotes || 0}\n`);
    
    // 2. Test upvote
    console.log('2. Testing upvote...');
    const upvoteResponse = await fetch(`${baseUrl}/${articleId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (upvoteResponse.ok) {
      const upvoteData = await upvoteResponse.json();
      console.log(`✅ Upvote successful: 👍 ${upvoteData.data.upvotes} 👎 ${upvoteData.data.downvotes}`);
      console.log(`   User vote: ${upvoteData.userVote || 'none'}\n`);
    } else {
      console.log(`❌ Upvote failed: ${upvoteResponse.statusText}\n`);
    }
    
    // 3. Test upvote again (should toggle off)
    console.log('3. Testing upvote again (should toggle off)...');
    const upvote2Response = await fetch(`${baseUrl}/${articleId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (upvote2Response.ok) {
      const upvote2Data = await upvote2Response.json();
      console.log(`✅ Upvote toggled off: 👍 ${upvote2Data.data.upvotes} 👎 ${upvote2Data.data.downvotes}`);
      console.log(`   User vote: ${upvote2Data.userVote || 'none'}\n`);
    } else {
      console.log(`❌ Upvote toggle failed: ${upvote2Response.statusText}\n`);
    }
    
    // 4. Test downvote
    console.log('4. Testing downvote...');
    const downvoteResponse = await fetch(`${baseUrl}/${articleId}/downvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (downvoteResponse.ok) {
      const downvoteData = await downvoteResponse.json();
      console.log(`✅ Downvote successful: 👍 ${downvoteData.data.upvotes} 👎 ${downvoteData.data.downvotes}`);
      console.log(`   User vote: ${downvoteData.userVote || 'none'}\n`);
    } else {
      console.log(`❌ Downvote failed: ${downvoteResponse.statusText}\n`);
    }
    
    // 5. Test switching from downvote to upvote
    console.log('5. Testing switch from downvote to upvote...');
    const switchResponse = await fetch(`${baseUrl}/${articleId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (switchResponse.ok) {
      const switchData = await switchResponse.json();
      console.log(`✅ Vote switched: 👍 ${switchData.data.upvotes} 👎 ${switchData.data.downvotes}`);
      console.log(`   User vote: ${switchData.userVote || 'none'}\n`);
    } else {
      console.log(`❌ Vote switch failed: ${switchResponse.statusText}\n`);
    }
    
    console.log('🎉 Voting system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVotingSystem();
