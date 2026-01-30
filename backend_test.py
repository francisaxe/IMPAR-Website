#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class IMPARAPITester:
    def __init__(self, base_url="https://survey-impar.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.owner_token = None
        self.user_token = None
        self.owner_id = None
        self.user_id = None
        self.survey_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    try:
                        error_detail = response.json()
                        print(f"   Error: {error_detail}")
                    except:
                        print(f"   Response: {response.text}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health"""
        return self.run_test("Health Check", "GET", "/health", 200)

    def test_register_owner(self):
        """Test owner registration (first user)"""
        test_email = f"owner_{uuid.uuid4().hex[:8]}@test.com"
        success, response = self.run_test(
            "Register Owner",
            "POST",
            "/auth/register",
            200,
            data={
                "email": test_email,
                "name": "Test Owner",
                "password": "TestPass123!"
            }
        )
        if success and 'access_token' in response:
            self.owner_token = response['access_token']
            self.owner_id = response['user']['id']
            print(f"   Owner role: {response['user']['role']}")
            return response['user']['role'] == 'owner'
        return False

    def test_register_user(self):
        """Test regular user registration"""
        test_email = f"user_{uuid.uuid4().hex[:8]}@test.com"
        success, response = self.run_test(
            "Register User",
            "POST",
            "/auth/register",
            200,
            data={
                "email": test_email,
                "name": "Test User",
                "password": "TestPass123!"
            }
        )
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   User role: {response['user']['role']}")
            return response['user']['role'] == 'user'
        return False

    def test_login(self, email, password):
        """Test login functionality"""
        success, response = self.run_test(
            "Login",
            "POST",
            "/auth/login",
            200,
            data={"email": email, "password": password}
        )
        return success and 'access_token' in response

    def test_get_profile(self):
        """Test getting user profile"""
        return self.run_test("Get Profile", "GET", "/auth/me", 200, token=self.owner_token)

    def test_update_profile(self):
        """Test updating user profile"""
        return self.run_test(
            "Update Profile",
            "PUT",
            "/auth/profile",
            200,
            data={"bio": "Updated bio", "name": "Updated Name"},
            token=self.owner_token
        )

    def test_create_survey(self):
        """Test creating a survey"""
        success, response = self.run_test(
            "Create Survey",
            "POST",
            "/surveys",
            200,
            data={
                "title": "Test Survey",
                "description": "A test survey",
                "is_featured": True,
                "questions": [
                    {
                        "type": "multiple_choice",
                        "text": "What is your favorite color?",
                        "required": True,
                        "highlighted": True,
                        "options": [
                            {"text": "Red"},
                            {"text": "Blue"},
                            {"text": "Green"}
                        ]
                    },
                    {
                        "type": "text",
                        "text": "Tell us about yourself",
                        "required": False,
                        "highlighted": False
                    },
                    {
                        "type": "rating",
                        "text": "Rate our service",
                        "required": True,
                        "highlighted": False,
                        "min_rating": 1,
                        "max_rating": 5
                    }
                ]
            },
            token=self.owner_token
        )
        if success and 'id' in response:
            self.survey_id = response['id']
            return True
        return False

    def test_get_surveys(self):
        """Test getting surveys list"""
        return self.run_test("Get Surveys", "GET", "/surveys", 200)

    def test_get_featured_surveys(self):
        """Test getting featured surveys"""
        return self.run_test("Get Featured Surveys", "GET", "/surveys", 200, params={"featured": "true"})

    def test_get_my_surveys(self):
        """Test getting user's surveys"""
        return self.run_test("Get My Surveys", "GET", "/surveys/my", 200, token=self.owner_token)

    def test_get_survey_by_id(self):
        """Test getting specific survey"""
        if not self.survey_id:
            return False
        return self.run_test("Get Survey by ID", "GET", f"/surveys/{self.survey_id}", 200)

    def test_publish_survey(self):
        """Test publishing a survey"""
        if not self.survey_id:
            return False
        return self.run_test(
            "Publish Survey",
            "PUT",
            f"/surveys/{self.survey_id}",
            200,
            data={"is_published": True},
            token=self.owner_token
        )

    def test_submit_survey_response(self):
        """Test submitting survey response"""
        if not self.survey_id:
            return False
        
        # First get the survey to get question IDs
        success, survey = self.run_test("Get Survey for Response", "GET", f"/surveys/{self.survey_id}", 200)
        if not success or 'questions' not in survey:
            return False
        
        questions = survey['questions']
        answers = []
        
        for q in questions:
            if q['type'] == 'multiple_choice' and q.get('options'):
                answers.append({
                    "question_id": q['id'],
                    "value": q['options'][0]['id']  # Select first option
                })
            elif q['type'] == 'text':
                answers.append({
                    "question_id": q['id'],
                    "value": "This is a test response"
                })
            elif q['type'] == 'rating':
                answers.append({
                    "question_id": q['id'],
                    "value": "4"
                })
        
        # Use requests directly without token for anonymous response
        url = f"{self.base_url}/surveys/{self.survey_id}/respond"
        headers = {'Content-Type': 'application/json'}
        
        try:
            response = requests.post(url, json={"answers": answers}, headers=headers)
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                if response.content:
                    try:
                        error_detail = response.json()
                        print(f"   Error: {error_detail}")
                    except:
                        print(f"   Response: {response.text}")
                self.failed_tests.append(f"Submit Survey Response: Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"Submit Survey Response: {str(e)}")
            return False

    def test_get_survey_responses(self):
        """Test getting survey responses"""
        if not self.survey_id:
            return False
        return self.run_test(
            "Get Survey Responses",
            "GET",
            f"/surveys/{self.survey_id}/responses",
            200,
            token=self.owner_token
        )

    def test_get_survey_analytics(self):
        """Test getting survey analytics"""
        if not self.survey_id:
            return False
        return self.run_test(
            "Get Survey Analytics",
            "GET",
            f"/surveys/{self.survey_id}/analytics",
            200,
            token=self.owner_token
        )

    def test_admin_get_users(self):
        """Test admin getting all users"""
        return self.run_test("Admin Get Users", "GET", "/admin/users", 200, token=self.owner_token)

    def test_create_suggestion(self):
        """Test creating a suggestion"""
        return self.run_test(
            "Create Suggestion",
            "POST",
            "/suggestions",
            200,
            data={"content": "This is a test suggestion"},
            token=self.user_token
        )

    def test_get_suggestions(self):
        """Test getting suggestions (admin only)"""
        return self.run_test("Get Suggestions", "GET", "/suggestions", 200, token=self.owner_token)

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        success, _ = self.run_test("Unauthorized Access", "GET", "/auth/me", 401)
        return success

def main():
    print("🚀 Starting IMPAR Survey API Tests")
    print("=" * 50)
    
    tester = IMPARAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Register Owner", tester.test_register_owner),
        ("Register User", tester.test_register_user),
        ("Get Profile", tester.test_get_profile),
        ("Update Profile", tester.test_update_profile),
        ("Create Survey", tester.test_create_survey),
        ("Get Surveys", tester.test_get_surveys),
        ("Get Featured Surveys", tester.test_get_featured_surveys),
        ("Get My Surveys", tester.test_get_my_surveys),
        ("Get Survey by ID", tester.test_get_survey_by_id),
        ("Publish Survey", tester.test_publish_survey),
        ("Submit Survey Response", tester.test_submit_survey_response),
        ("Get Survey Responses", tester.test_get_survey_responses),
        ("Get Survey Analytics", tester.test_get_survey_analytics),
        ("Admin Get Users", tester.test_admin_get_users),
        ("Create Suggestion", tester.test_create_suggestion),
        ("Get Suggestions", tester.test_get_suggestions),
        ("Unauthorized Access", tester.test_unauthorized_access),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            tester.failed_tests.append(f"{test_name}: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failure in tester.failed_tests:
            print(f"  - {failure}")
    
    print(f"\n🔑 Owner Token: {tester.owner_token[:20] + '...' if tester.owner_token else 'None'}")
    print(f"🔑 User Token: {tester.user_token[:20] + '...' if tester.user_token else 'None'}")
    print(f"📋 Survey ID: {tester.survey_id}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())