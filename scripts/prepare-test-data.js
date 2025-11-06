/**
 * Prepare test data for Story 2.4 manual testing
 * Run with: node scripts/prepare-test-data.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:55321'
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

const supabase = createClient(supabaseUrl, supabaseKey)

async function prepareTestData() {
  console.log('🔍 Checking test environment...\n')

  // Check if user is logged in (you'll need to provide auth token)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.log('❌ No authenticated user found')
    console.log('👉 Please login at http://localhost:3000 first\n')
    console.log('Instructions:')
    console.log('1. Open http://localhost:3000')
    console.log('2. Login with your credentials')
    console.log('3. Then run this script again\n')
    return
  }

  console.log(`✅ Logged in as: ${user.email}`)
  console.log(`   User ID: ${user.id}\n`)

  // Check existing unorganized somethings
  const { data: unorganized, error: fetchError } = await supabase
    .from('somethings')
    .select('id, text_content, realm, created_at')
    .eq('user_id', user.id)
    .is('realm', null)
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.log('❌ Error fetching somethings:', fetchError.message)
    return
  }

  console.log(`📊 Found ${unorganized.length} unorganized somethings\n`)

  if (unorganized.length > 0) {
    console.log('Existing unorganized somethings:')
    unorganized.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.text_content?.substring(0, 50) || '[No text]'}...`)
    })
    console.log()
  }

  // Create test somethings if needed
  if (unorganized.length < 5) {
    console.log(`🔧 Creating test somethings (need at least 5)...\n`)

    const testSomethings = [
      { text_content: 'Coffee at Blue Bottle Palo Alto - great vibes and latte art' },
      { text_content: 'Reflection on AI consciousness and the nature of intelligence' },
      { text_content: 'Walk through Golden Gate Park on a sunny afternoon' },
      { text_content: 'Insight about work-life balance and sustainable productivity' },
      { text_content: 'Amazing dinner at Zuni Cafe - the roast chicken was perfect' }
    ]

    for (const something of testSomethings) {
      const { data, error } = await supabase
        .from('somethings')
        .insert({
          user_id: user.id,
          text_content: something.text_content,
          realm: null,
          domain: 'abode',
          captured_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.log(`❌ Error creating something: ${error.message}`)
      } else {
        console.log(`✅ Created: ${something.text_content.substring(0, 50)}...`)
      }
    }

    console.log()
  }

  // Final check
  const { data: finalUnorganized, error: finalError } = await supabase
    .from('somethings')
    .select('id')
    .eq('user_id', user.id)
    .is('realm', null)

  if (!finalError) {
    console.log(`\n✅ Test data ready! You have ${finalUnorganized.length} unorganized somethings\n`)
    console.log('🚀 You can now start manual testing:')
    console.log('   http://localhost:3000/dashboard\n')
  }
}

prepareTestData().catch(console.error)
