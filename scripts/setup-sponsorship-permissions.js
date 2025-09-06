const strapi = require('@strapi/strapi')

async function setupSponsorshipPermissions() {
  console.log('🔧 Setting up Global Sponsorship permissions...')

  try {
    // Get the public role
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' }
    })

    if (!publicRole) {
      console.error('❌ Public role not found')
      return
    }

    // Get current permissions
    const currentPermissions = await strapi.query('plugin::users-permissions.permission').findMany({
      where: { role: publicRole.id }
    })

    // Check if global-sponsorship permissions already exist
    const existingPermission = currentPermissions.find(
      p => p.action === 'api::global-sponsorship.global-sponsorship.find'
    )

    if (existingPermission) {
      console.log('✅ Global sponsorship permissions already exist')
      return
    }

    // Create the permission for global-sponsorship find
    await strapi.query('plugin::users-permissions.permission').create({
      data: {
        action: 'api::global-sponsorship.global-sponsorship.find',
        subject: null,
        properties: {},
        conditions: [],
        role: publicRole.id
      }
    })

    console.log('✅ Global sponsorship permissions created successfully')
    console.log('   - Public users can now read global sponsorships')
    console.log('   - API endpoint: /api/global-sponsorships')

  } catch (error) {
    console.error('❌ Error setting up permissions:', error.message)
  }
}

// Run the setup
setupSponsorshipPermissions()
  .then(() => {
    console.log('🎉 Permission setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
