/**
 * Script to update existing radio stations with DisplayOrder field
 * Run this script after adding the DisplayOrder field to your schema
 */

const updateRadioStationDisplayOrder = async () => {
  try {
    console.log('🔄 Starting radio station display order update...')
    
    // Get all radio stations
    const response = await fetch('https://api.pattaya1.com/api/radio-stations')
    if (!response.ok) {
      throw new Error(`Failed to fetch radio stations: ${response.status}`)
    }
    
    const data = await response.json()
    const stations = data.data || []
    
    if (stations.length === 0) {
      console.log('ℹ️ No radio stations found to update')
      return
    }
    
    console.log(`📻 Found ${stations.length} radio stations to update`)
    
    // Update each station with a display order
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i]
      const displayOrder = i + 1 // Start from 1
      
      console.log(`📝 Updating ${station.attributes.Name} (ID: ${station.id}) with display order: ${displayOrder}`)
      
      const updateResponse = await fetch(`https://api.pattaya1.com/api/radio-stations/${station.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            DisplayOrder: displayOrder
          }
        })
      })
      
      if (!updateResponse.ok) {
        console.error(`❌ Failed to update station ${station.attributes.Name}: ${updateResponse.status}`)
      } else {
        console.log(`✅ Successfully updated ${station.attributes.Name}`)
      }
    }
    
    console.log('🎉 Radio station display order update completed!')
    
  } catch (error) {
    console.error('❌ Error updating radio station display order:', error)
  }
}

// Run the script
updateRadioStationDisplayOrder()
