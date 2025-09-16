/**
 * Manual API testing script
 * This script demonstrates how to use the Task API
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE = `http://localhost:${process.env.PORT || 3000}/api`;

// Function to make HTTP requests with error handling
async function makeRequest(method, url, data = null) {
    try {
        const config = {
            method,
            url: `${API_BASE}${url}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`❌ ${method} ${url} - ${error.response.status}:`, error.response.data);
        } else {
            console.error(`❌ ${method} ${url} - Error:`, error.message);
        }
        throw error;
    }
}

async function testAPI() {
    console.log('🧪 Testing Task Management API...\n');

    try {
        // Test 1: Get all tasks
        console.log('1️⃣  Testing GET /api/tasks');
        const allTasks = await makeRequest('GET', '/tasks');
        console.log(`✅ Found ${allTasks.data.length} tasks`);
        console.log(`📊 Total: ${allTasks.meta.total}\n`);

        // Test 2: Create a new task
        console.log('2️⃣  Testing POST /api/tasks');
        const newTaskData = {
            title: 'API Test Task',
            description: 'This task was created by the test script',
            completed: false
        };
        const createdTask = await makeRequest('POST', '/tasks', newTaskData);
        console.log(`✅ Created task with ID: ${createdTask.data.id}`);
        const taskId = createdTask.data.id;

        // Test 3: Get the created task
        console.log('\n3️⃣  Testing GET /api/tasks/:id');
        const singleTask = await makeRequest('GET', `/tasks/${taskId}`);
        console.log(`✅ Retrieved task: "${singleTask.data.title}"`);

        // Test 4: Update the task
        console.log('\n4️⃣  Testing PUT /api/tasks/:id');
        const updateData = {
            title: 'Updated API Test Task',
            description: 'This task was updated by the test script',
            completed: false
        };
        const updatedTask = await makeRequest('PUT', `/tasks/${taskId}`, updateData);
        console.log(`✅ Updated task: "${updatedTask.data.title}"`);

        // Test 5: Mark as completed
        console.log('\n5️⃣  Testing PATCH /api/tasks/:id/complete');
        const completedTask = await makeRequest('PATCH', `/tasks/${taskId}/complete`);
        console.log(`✅ Marked task as completed: ${completedTask.data.completed}`);

        // Test 6: Mark as pending
        console.log('\n6️⃣  Testing PATCH /api/tasks/:id/pending');
        const pendingTask = await makeRequest('PATCH', `/tasks/${taskId}/pending`);
        console.log(`✅ Marked task as pending: ${!pendingTask.data.completed}`);

        // Test 7: Get task statistics
        console.log('\n7️⃣  Testing GET /api/tasks/stats');
        const stats = await makeRequest('GET', '/tasks/stats');
        console.log(`✅ Task Statistics:`);
        console.log(`   📋 Total: ${stats.data.total}`);
        console.log(`   ✅ Completed: ${stats.data.completed}`);
        console.log(`   ⏳ Pending: ${stats.data.pending}`);
        console.log(`   📈 Completion Rate: ${stats.data.completionRate}%`);

        // Test 8: Filter tasks
        console.log('\n8️⃣  Testing GET /api/tasks with filters');
        const filteredTasks = await makeRequest('GET', '/tasks?completed=false&limit=5');
        console.log(`✅ Found ${filteredTasks.data.length} pending tasks (limited to 5)`);

        // Test 9: Delete the test task
        console.log('\n9️⃣  Testing DELETE /api/tasks/:id');
        await makeRequest('DELETE', `/tasks/${taskId}`);
        console.log(`✅ Deleted test task with ID: ${taskId}`);

        // Test 10: Verify deletion
        console.log('\n🔟 Verifying task deletion');
        try {
            await makeRequest('GET', `/tasks/${taskId}`);
            console.log('❌ Task should have been deleted');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Task successfully deleted (404 as expected)');
            } else {
                throw error;
            }
        }

        console.log('\n🎉 All API tests completed successfully!');

    } catch (error) {
        console.log('\n💥 API test failed');
        process.exit(1);
    }
}

// Run the tests
if (require.main === module) {
    testAPI();
}

module.exports = testAPI;
