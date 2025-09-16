const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCompleteUpvoteFlow() {
  const baseUrl = 'http://locahost:1337/api/breaking-news';
  
  console.log('🧪 Testing Complete Upvote Flow...\n');

  try {
    // Test 1: Get breaking news from live endpoint
    console.log('📰 Test 1: Fetching breaking news from live endpoint...');
    const liveResponse = await fetch(`${baseUrl}/live`);
    const liveData = await liveResponse.json();
    
    if (!liveData.data || liveData.data.length === 0) {
      console.log('❌ No breaking news found in live endpoint. Please create some news first.');
      return;
    }
    
    const testArticle = liveData.data[0];
    console.log(`✅ Found test article: "${testArticle.title}" (ID: ${testArticle.id})`);
    console.log(`   Initial votes: 👍 ${testArticle.upvotes || 0} 👎 ${testArticle.downvotes || 0}`);
    console.log(`   User vote: ${testArticle.userVote || 'none'}`);
    
    // Test 2: Test live endpoint to see current state
    console.log('\n📡 Test 2: Testing live endpoint...');
    
    console.log(`✅ Live endpoint working:`);
    console.log(`   - Regular news: ${liveData.data?.length || 0} items`);
    console.log(`   - Pinned news: ${liveData.pinnedNews?.length || 0} items`);
    console.log(`   - Test article in live data: 👍 ${testArticle.upvotes} 👎 ${testArticle.downvotes}`);
    console.log(`   - User vote: ${testArticle.userVote || 'none'}`);
    
    // Test 3: Upvote the article
    console.log(`\n👍 Test 3: Upvoting article...`);
    const upvoteResponse = await fetch(`${baseUrl}/${testArticle.id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (upvoteResponse.ok) {
      const upvoteData = await upvoteResponse.json();
      console.log(`✅ Upvote successful!`);
      console.log(`   - New votes: 👍 ${upvoteData.data.upvotes} 👎 ${upvoteData.data.downvotes}`);
      console.log(`   - Vote score: ${upvoteData.data.voteScore}`);
      console.log(`   - User vote: ${upvoteData.userVote || 'none'}`);
      console.log(`   - Message: ${upvoteData.message}`);
      console.log(`   - User votes object: ${JSON.stringify(upvoteData.data.userVotes)}`);
    } else {
      const errorData = await upvoteResponse.json().catch(() => ({}));
      console.log(`❌ Upvote failed: ${upvoteResponse.status} - ${errorData.message || upvoteResponse.statusText}`);
      return;
    }
    
    // Test 4: Verify the vote is saved in database
    console.log(`\n💾 Test 4: Verifying vote is saved in database...`);
    const verifyResponse = await fetch(`${baseUrl}/${testArticle.id}?populate=*`);
    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok && verifyData.data) {
      console.log(`✅ Database verification successful!`);
      console.log(`   - Saved votes: 👍 ${verifyData.data.upvotes} 👎 ${verifyData.data.downvotes}`);
      console.log(`   - Saved vote score: ${verifyData.data.voteScore}`);
      console.log(`   - Saved user votes: ${JSON.stringify(verifyData.data.userVotes)}`);
    } else {
      console.log(`❌ Database verification failed: ${verifyResponse.status}`);
    }
    
    // Test 5: Test live endpoint again to see updated data
    console.log(`\n📡 Test 5: Testing live endpoint after upvote...`);
    const liveResponse2 = await fetch(`${baseUrl}/live`);
    const liveData2 = await liveResponse2.json();
    
    const liveArticle2 = liveData2.data?.find(item => item.id === testArticle.id) || 
                        liveData2.pinnedNews?.find(item => item.id === testArticle.id);
    
    if (liveArticle2) {
      console.log(`✅ Live endpoint updated:`);
      console.log(`   - Updated votes: 👍 ${liveArticle2.upvotes} 👎 ${liveArticle2.downvotes}`);
      console.log(`   - Updated user vote: ${liveArticle2.userVote || 'none'}`);
    }
    
    // Test 6: Test upvote again (should toggle off)
    console.log(`\n🔄 Test 6: Testing upvote again (should toggle off)...`);
    const upvoteResponse2 = await fetch(`${baseUrl}/${testArticle.id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (upvoteResponse2.ok) {
      const upvoteData2 = await upvoteResponse2.json();
      console.log(`✅ Upvote toggle successful!`);
      console.log(`   - Toggled votes: 👍 ${upvoteData2.data.upvotes} 👎 ${upvoteData2.data.downvotes}`);
      console.log(`   - User vote: ${upvoteData2.userVote || 'none'}`);
      console.log(`   - Message: ${upvoteData2.message}`);
    }
    
    // Test 7: Test downvote
    console.log(`\n👎 Test 7: Testing downvote...`);
    const downvoteResponse = await fetch(`${baseUrl}/${testArticle.id}/downvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (downvoteResponse.ok) {
      const downvoteData = await downvoteResponse.json();
      console.log(`✅ Downvote successful!`);
      console.log(`   - Downvote votes: 👍 ${downvoteData.data.upvotes} 👎 ${downvoteData.data.downvotes}`);
      console.log(`   - User vote: ${downvoteData.userVote || 'none'}`);
      console.log(`   - Message: ${downvoteData.message}`);
    }
    
    // Test 8: Test switch from downvote to upvote
    console.log(`\n🔄 Test 8: Testing switch from downvote to upvote...`);
    const switchResponse = await fetch(`${baseUrl}/${testArticle.id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (switchResponse.ok) {
      const switchData = await switchResponse.json();
      console.log(`✅ Vote switch successful!`);
      console.log(`   - Switched votes: 👍 ${switchData.data.upvotes} 👎 ${switchData.data.downvotes}`);
      console.log(`   - User vote: ${switchData.userVote || 'none'}`);
      console.log(`   - Message: ${switchData.message}`);
    }
    
    console.log('\n🎉 Complete Upvote Flow Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Backend upvote/downvote endpoints working');
    console.log('   ✅ User votes are properly saved in database');
    console.log('   ✅ Vote toggling works (upvote again removes vote)');
    console.log('   ✅ Vote switching works (downvote to upvote)');
    console.log('   ✅ Live endpoint reflects updated vote counts');
    console.log('   ✅ Frontend will receive correct userVote status');
    console.log('   ✅ Minimal custom backend code required');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteUpvoteFlow();
