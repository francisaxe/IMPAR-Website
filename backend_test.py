#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class IMPARAPITester:
    def __init__(self, base_url="https://impar-survey.preview.emergentagent.com/api"):
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

    def test_login_existing_user(self, email, password):
        """Test login with existing credentials"""
        success, response = self.run_test(
            f"Login Existing User ({email})",
            "POST",
            "/auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            return response['access_token'], response['user']
        return None, None

    def test_create_survey_with_all_question_types(self, token):
        """Test creating Survey #4 with all 5 question types as specified in review request"""
        success, response = self.run_test(
            "Create Survey #4 - Inquérito Político 2026",
            "POST",
            "/surveys",
            200,
            data={
                "title": "Inquérito Político 2026",
                "description": "Inquérito sobre preferências políticas para as eleições de 2026",
                "is_featured": True,
                "is_published": True,
                "questions": [
                    {
                        "type": "multiple_choice",
                        "text": "Qual é o seu partido político preferido?",
                        "required": True,
                        "options": [
                            {"text": "PS"},
                            {"text": "PSD"},
                            {"text": "Chega"},
                            {"text": "IL"},
                            {"text": "BE"},
                            {"text": "CDU"},
                            {"text": "Outro"}
                        ]
                    },
                    {
                        "type": "text",
                        "text": "Porque é que escolheu esse partido?",
                        "required": False
                    },
                    {
                        "type": "rating",
                        "text": "Como avalia a gestão do governo atual? (1-5)",
                        "required": True,
                        "min_rating": 1,
                        "max_rating": 5
                    },
                    {
                        "type": "yes_no",
                        "text": "Concorda com a política económica atual?",
                        "required": True
                    },
                    {
                        "type": "checkbox",
                        "text": "Quais temas são mais importantes para si?",
                        "required": True,
                        "options": [
                            {"text": "Saúde"},
                            {"text": "Educação"},
                            {"text": "Segurança"},
                            {"text": "Economia"},
                            {"text": "Ambiente"},
                            {"text": "Habitação"}
                        ]
                    }
                ]
            },
            token=token
        )
        if success and 'id' in response:
            return response['id']
        return None

    def test_submit_complete_survey_response(self, survey_id, token):
        """Test submitting response with all 5 question types as specified in review request"""
        if not survey_id:
            return False
        
        # First get the survey to get question IDs
        success, survey = self.run_test("Get Survey #4 for Response", "GET", f"/surveys/{survey_id}", 200)
        if not success or 'questions' not in survey:
            return False
        
        questions = survey['questions']
        answers = []
        
        for q in questions:
            if q['type'] == 'multiple_choice' and "partido político" in q['text'].lower():
                # Q1: Select "PS"
                ps_option = next((opt for opt in q.get('options', []) if opt['text'] == 'PS'), None)
                if ps_option:
                    answers.append({
                        "question_id": q['id'],
                        "value": ps_option['id']
                    })
            elif q['type'] == 'text' and "escolheu esse partido" in q['text'].lower():
                # Q2: "Política social forte"
                answers.append({
                    "question_id": q['id'],
                    "value": "Política social forte"
                })
            elif q['type'] == 'rating' and "gestão do governo" in q['text'].lower():
                # Q3: Rating 4
                answers.append({
                    "question_id": q['id'],
                    "value": "4"
                })
            elif q['type'] == 'yes_no' and "política económica" in q['text'].lower():
                # Q4: "Sim"
                answers.append({
                    "question_id": q['id'],
                    "value": "Sim"
                })
            elif q['type'] == 'checkbox' and "temas são mais importantes" in q['text'].lower():
                # Q5: Select multiple: "Saúde", "Educação", "Economia"
                selected_options = []
                for opt in q.get('options', []):
                    if opt['text'] in ['Saúde', 'Educação', 'Economia']:
                        selected_options.append(opt['id'])
                if selected_options:
                    answers.append({
                        "question_id": q['id'],
                        "value": ",".join(selected_options)
                    })
        
        return self.run_test(
            "Submit Complete Survey #4 Response",
            "POST",
            f"/surveys/{survey_id}/respond",
            200,
            data={"answers": answers},
            token=token
        )

    def test_my_responses_endpoint(self, token):
        """Test /api/my-responses endpoint for user view with global results"""
        success, response = self.run_test(
            "Get My Responses with Global Results",
            "GET",
            "/my-responses",
            200,
            token=token
        )
        
        if success and response:
            print(f"   Found {len(response)} user responses")
            for resp in response:
                if 'survey' in resp and 'global_results' in resp:
                    survey_title = resp['survey'].get('title', 'Unknown')
                    print(f"   Survey: {survey_title}")
                    print(f"   Total responses: {resp.get('total_responses', 0)}")
                    
                    # Check that vote counts are NOT visible (only percentages)
                    for q_id, results in resp['global_results'].items():
                        if 'percentages' in results:
                            print(f"   Question results show percentages: ✅")
                        if 'count' in str(results).lower():
                            print(f"   ⚠️  WARNING: Vote counts may be visible to regular user")
                            
        return success

    def test_public_results_endpoint(self, survey_id):
        """Test public results endpoint (should show percentages only)"""
        if not survey_id:
            return False
            
        success, response = self.run_test(
            "Get Public Survey Results",
            "GET",
            f"/surveys/{survey_id}/public-results",
            200
        )
        
        if success and response:
            print(f"   Total responses: {response.get('total_responses', 0)}")
            questions = response.get('questions', {})
            for q_id, q_data in questions.items():
                q_type = q_data.get('type')
                print(f"   Question type {q_type}: {q_data.get('total_answers', 0)} answers")
                
                # Check for vote count visibility
                if 'count' in str(q_data).lower() and q_type != 'text':
                    print(f"   ⚠️  Vote counts visible in public results")
                    
        return success

    def test_admin_analytics_endpoint(self, survey_id, admin_token):
        """Test admin analytics endpoint (should show vote counts)"""
        if not survey_id or not admin_token:
            return False
            
        success, response = self.run_test(
            "Get Admin Survey Analytics",
            "GET",
            f"/surveys/{survey_id}/analytics",
            200,
            token=admin_token
        )
        
        if success and response:
            print(f"   Admin view - Total responses: {response.get('total_responses', 0)}")
            questions = response.get('questions', {})
            for q_id, q_data in questions.items():
                q_type = q_data.get('type')
                if 'option_breakdown' in q_data:
                    for opt_id, opt_data in q_data['option_breakdown'].items():
                        if 'count' in opt_data:
                            print(f"   Admin can see vote counts: ✅")
                            break
                            
        return success

def main():
    print("🎯 TESTE COMPLETO DO FLUXO DE RESPOSTA AO INQUÉRITO #4")
    print("=" * 60)
    
    tester = IMPARAPITester()
    
    # Step 1: Test health and login
    print("\n📋 STEP 1: Authentication and Setup")
    tester.test_health_check()
    
    # Login as existing users
    user_token, user_data = tester.test_login_existing_user("user@test.com", "password123")
    owner_token, owner_data = tester.test_login_existing_user("owner@test.com", "password123")
    
    if not user_token:
        print("❌ CRITICAL: Cannot login as user@test.com - authentication failed")
        return 1
    
    if not owner_token:
        print("❌ CRITICAL: Cannot login as owner@test.com - admin authentication failed")
        return 1
    
    print(f"✅ User login successful: {user_data.get('name', 'Unknown')} ({user_data.get('role', 'Unknown')})")
    print(f"✅ Admin login successful: {owner_data.get('name', 'Unknown')} ({owner_data.get('role', 'Unknown')})")
    
    # Step 2: Check existing surveys and create Survey #4 if needed
    print("\n📋 STEP 2: Survey #4 'Inquérito Político 2026' Setup")
    
    # Get existing surveys to check if Survey #4 exists
    success, surveys = tester.run_test("Get All Surveys", "GET", "/surveys", 200)
    survey_4_id = None
    
    if success:
        print(f"   Found {len(surveys)} existing surveys")
        for survey in surveys:
            if "Inquérito Político 2026" in survey.get('title', ''):
                survey_4_id = survey['id']
                print(f"   Found existing Survey #4: {survey['title']}")
                break
    
    if not survey_4_id:
        print("   Survey #4 not found, creating it...")
        survey_4_id = tester.test_create_survey_with_all_question_types(owner_token)
        if survey_4_id:
            print(f"   ✅ Created Survey #4: {survey_4_id}")
        else:
            print("   ❌ Failed to create Survey #4")
            return 1
    
    # Step 3: Verify Survey #4 has all 5 question types
    print("\n📋 STEP 3: Verify Survey #4 Question Types")
    success, survey_details = tester.run_test("Get Survey #4 Details", "GET", f"/surveys/{survey_4_id}", 200)
    
    if success and 'questions' in survey_details:
        questions = survey_details['questions']
        print(f"   Survey #4 has {len(questions)} questions")
        
        question_types = [q.get('type') for q in questions]
        expected_types = ['multiple_choice', 'text', 'rating', 'yes_no', 'checkbox']
        
        for expected_type in expected_types:
            if expected_type in question_types:
                print(f"   ✅ {expected_type} question found")
            else:
                print(f"   ❌ {expected_type} question MISSING")
        
        if len(questions) == 5 and all(t in question_types for t in expected_types):
            print("   ✅ All 5 question types confirmed")
        else:
            print(f"   ❌ Survey #4 incomplete - has {len(questions)} questions, expected 5 with all types")
    
    # Step 4: Submit survey response as user
    print("\n📋 STEP 4: Submit Survey Response as User")
    success, response_data = tester.test_submit_complete_survey_response(survey_4_id, user_token)
    
    if success:
        print("   ✅ Survey response submitted successfully")
    else:
        print("   ❌ Failed to submit survey response")
    
    # Step 5: Test My Responses endpoint
    print("\n📋 STEP 5: Test My Responses Page")
    tester.test_my_responses_endpoint(user_token)
    
    # Step 6: Test public results (user view)
    print("\n📋 STEP 6: Test Public Results (User View)")
    tester.test_public_results_endpoint(survey_4_id)
    
    # Step 7: Test admin analytics (admin view)
    print("\n📋 STEP 7: Test Admin Analytics (Admin View)")
    tester.test_admin_analytics_endpoint(survey_4_id, owner_token)
    
    # Step 8: Verify surveys list shows "Respondida" badge
    print("\n📋 STEP 8: Verify Response Status Indicator")
    success, user_surveys = tester.run_test("Get Surveys as User", "GET", "/surveys", 200, token=user_token)
    
    if success:
        for survey in user_surveys:
            if survey['id'] == survey_4_id:
                has_responded = survey.get('user_has_responded', False)
                if has_responded:
                    print("   ✅ Survey shows 'user_has_responded: true' - badge should appear")
                else:
                    print("   ❌ Survey shows 'user_has_responded: false' - badge missing")
                break
    
    # Print final results
    print("\n" + "=" * 60)
    print("📊 TESTE COMPLETO - RESULTADOS FINAIS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failure in tester.failed_tests:
            print(f"  - {failure}")
    else:
        print("\n✅ ALL TESTS PASSED!")
    
    print(f"\n🔑 User Token: {user_token[:20] + '...' if user_token else 'None'}")
    print(f"🔑 Admin Token: {owner_token[:20] + '...' if owner_token else 'None'}")
    print(f"📋 Survey #4 ID: {survey_4_id}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())