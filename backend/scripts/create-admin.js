// Script to create admin user via API
const API_BASE_URL = 'http://localhost:5000';

async function createAdminUser() {
  try {
    console.log('Creating admin user via API...');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@plekhanov.ru',
        password: 'admin123',
        role: 'admin'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin user created successfully!');
      console.log('Email:', data.user.email);
      console.log('Role:', data.user.role);
      console.log('\nYou can now login at:', `${API_BASE_URL}/admin`);
      console.log('Email: admin@plekhanov.ru');
      console.log('Password: admin123');
    } else {
      const error = await response.json();
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Admin user already exists!');
        console.log('You can login with:');
        console.log('Email: admin@plekhanov.ru');
        console.log('Password: admin123');
      } else {
        console.error('❌ Error:', error);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    console.log('Make sure backend is running on port 5000');
  }
}

createAdminUser();
