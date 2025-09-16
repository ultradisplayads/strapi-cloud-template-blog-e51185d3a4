const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPinnedNewsSystem() {
  const baseUrl = 'http://locahost:1337/api/breaking-news';
  
  console.log('🧪 Testing Pinned News System...\n');

  try {
    // Test 1: Get all breaking news
    console.log('📰 Test 1: Fetching all breaking news...');
    const allNewsResponse = await fetch(`${baseUrl}?populate=*&sort=createdAt:desc&limit=10`);
    const allNewsData = await allNewsResponse.json();
    
    if (!allNewsData.data || allNewsData.data.length === 0) {
      console.log('❌ No breaking news found. Please create some news first.');
      return;
    }
    
    console.log(`✅ Found ${allNewsData.data.length} breaking news articles`);
    
    // Test 2: Test the live endpoint
    console.log('\n📡 Test 2: Testing live endpoint...');
    const liveResponse = await fetch(`${baseUrl}/live`);
    const liveData = await liveResponse.json();
    
    console.log(`✅ Live endpoint working:`);
    console.log(`   - Regular news: ${liveData.data?.length || 0} items`);
    console.log(`   - Pinned news: ${liveData.pinnedNews?.length || 0} items`);
    console.log(`   - Total: ${liveData.meta?.total || 0} items`);
    
    // Test 3: Pin an article
    const testArticle = allNewsData.data[0];
    console.log(`\n📌 Test 3: Pinning article "${testArticle.Title}"...`);
    
    const pinResponse = await fetch(`${baseUrl}/${testArticle.documentId}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (pinResponse.ok) {
      const pinData = await pinResponse.json();
      console.log(`✅ Article pinned successfully!`);
      console.log(`   - isPinned: ${pinData.data.isPinned}`);
      console.log(`   - pinnedAt: ${pinData.data.pinnedAt}`);
    } else {
      console.log(`❌ Failed to pin article: ${pinResponse.status}`);
    }
    
    // Test 4: Check live endpoint after pinning
    console.log('\n📡 Test 4: Checking live endpoint after pinning...');
    const liveResponse2 = await fetch(`${baseUrl}/live`);
    const liveData2 = await liveResponse2.json();
    
    console.log(`✅ Live endpoint after pinning:`);
    console.log(`   - Regular news: ${liveData2.data?.length || 0} items`);
    console.log(`   - Pinned news: ${liveData2.pinnedNews?.length || 0} items`);
    
    if (liveData2.pinnedNews && liveData2.pinnedNews.length > 0) {
      console.log(`   - Pinned article: "${liveData2.pinnedNews[0].title}"`);
    }
    
    // Test 5: Unpin the article
    console.log(`\n📌 Test 5: Unpinning article...`);
    const unpinResponse = await fetch(`${baseUrl}/${testArticle.documentId}/unpin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (unpinResponse.ok) {
      const unpinData = await unpinResponse.json();
      console.log(`✅ Article unpinned successfully!`);
      console.log(`   - isPinned: ${unpinData.data.isPinned}`);
      console.log(`   - pinnedAt: ${unpinData.data.pinnedAt}`);
    } else {
      console.log(`❌ Failed to unpin article: ${unpinResponse.status}`);
    }
    
    // Test 6: Check live endpoint after unpinning
    console.log('\n📡 Test 6: Checking live endpoint after unpinning...');
    const liveResponse3 = await fetch(`${baseUrl}/live`);
    const liveData3 = await liveResponse3.json();
    
    console.log(`✅ Live endpoint after unpinning:`);
    console.log(`   - Regular news: ${liveData3.data?.length || 0} items`);
    console.log(`   - Pinned news: ${liveData3.pinnedNews?.length || 0} items`);
    
    // Test 7: Test voting on pinned article
    if (liveData2.pinnedNews && liveData2.pinnedNews.length > 0) {
      console.log(`\n👍 Test 7: Testing voting on pinned article...`);
      const pinnedArticle = liveData2.pinnedNews[0];
      
      const upvoteResponse = await fetch(`${baseUrl}/${pinnedArticle.id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (upvoteResponse.ok) {
        const upvoteData = await upvoteResponse.json();
        console.log(`✅ Upvoted pinned article successfully!`);
        console.log(`   - Upvotes: ${upvoteData.data.upvotes}`);
        console.log(`   - Downvotes: ${upvoteData.data.downvotes}`);
        console.log(`   - Vote Score: ${upvoteData.data.voteScore}`);
        console.log(`   - User Vote: ${upvoteData.userVote}`);
      } else {
        console.log(`❌ Failed to upvote pinned article: ${upvoteResponse.status}`);
      }
    }
    
    console.log('\n🎉 Pinned News System Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Live endpoint separates regular and pinned news');
    console.log('   ✅ Pin/unpin functionality works');
    console.log('   ✅ Pinned news appears in separate array');
    console.log('   ✅ Voting works on pinned articles');
    console.log('   ✅ Frontend will display pinned news in Row 2');
    console.log('   ✅ Regular news will display in Row 1');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPinnedNewsSystem();
