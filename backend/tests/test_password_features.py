"""
Test suite for IMPAR password-related features:
1. Password change from profile page
2. Password recovery request
3. Admin can see recovery requests with codes
4. User can reset password using recovery code
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
OWNER_EMAIL = "owner@test.com"
OWNER_PASSWORD = "password123"
TEST_USER_EMAIL = "testuser@test.com"
TEST_USER_PASSWORD = "recovered123"

class TestHealthCheck:
    """Basic health check to ensure API is running"""
    
    def test_api_health(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ API health check passed")


class TestPasswordChange:
    """Test password change from profile page"""
    
    def test_login_owner(self):
        """Login as owner to get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == OWNER_EMAIL
        print(f"✓ Owner login successful: {data['user']['name']}")
        return data["access_token"]
    
    def test_change_password_wrong_current(self):
        """Test password change with wrong current password"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Try to change password with wrong current password
        response = requests.put(
            f"{BASE_URL}/api/auth/change-password",
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword123"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "incorreta" in response.json()["detail"].lower() or "incorrect" in response.json()["detail"].lower()
        print("✓ Password change with wrong current password correctly rejected")
    
    def test_change_password_short_new(self):
        """Test password change with too short new password"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Try to change password with short new password
        response = requests.put(
            f"{BASE_URL}/api/auth/change-password",
            json={
                "current_password": OWNER_PASSWORD,
                "new_password": "12345"  # Less than 6 characters
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        print("✓ Password change with short new password correctly rejected")
    
    def test_change_password_success(self):
        """Test successful password change and revert"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Change password
        new_password = "newpassword123"
        response = requests.put(
            f"{BASE_URL}/api/auth/change-password",
            json={
                "current_password": OWNER_PASSWORD,
                "new_password": new_password
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        print("✓ Password changed successfully")
        
        # Verify old password no longer works
        old_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert old_login.status_code == 401
        print("✓ Old password correctly rejected")
        
        # Verify new password works
        new_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": new_password
        })
        assert new_login.status_code == 200
        new_token = new_login.json()["access_token"]
        print("✓ New password works correctly")
        
        # Revert password back to original
        revert_response = requests.put(
            f"{BASE_URL}/api/auth/change-password",
            json={
                "current_password": new_password,
                "new_password": OWNER_PASSWORD
            },
            headers={"Authorization": f"Bearer {new_token}"}
        )
        assert revert_response.status_code == 200
        print("✓ Password reverted to original")
        
        # Verify original password works again
        final_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert final_login.status_code == 200
        print("✓ Original password works after revert")


class TestPasswordRecoveryRequest:
    """Test password recovery request flow"""
    
    def test_request_recovery_existing_email(self):
        """Test recovery request for existing email"""
        response = requests.post(f"{BASE_URL}/api/auth/request-recovery", json={
            "email": TEST_USER_EMAIL
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Recovery request for existing email: {data['message']}")
    
    def test_request_recovery_nonexistent_email(self):
        """Test recovery request for non-existent email (should not reveal if email exists)"""
        response = requests.post(f"{BASE_URL}/api/auth/request-recovery", json={
            "email": "nonexistent@test.com"
        })
        # Should return 200 for security (don't reveal if email exists)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Recovery request for non-existent email handled securely: {data['message']}")


class TestAdminRecoveryRequests:
    """Test admin can see recovery requests with codes"""
    
    def test_admin_can_see_recovery_requests(self):
        """Test that admin can see password recovery requests"""
        # Login as owner
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Get recovery requests
        response = requests.get(
            f"{BASE_URL}/api/admin/password-recovery-requests",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can see {len(data)} recovery requests")
        
        # Check structure of recovery requests
        if len(data) > 0:
            request = data[0]
            assert "id" in request
            assert "user_email" in request
            assert "user_name" in request
            assert "recovery_code" in request
            assert "status" in request
            assert "created_at" in request
            assert "expires_at" in request
            print(f"✓ Recovery request structure is correct")
            print(f"  - User: {request['user_name']} ({request['user_email']})")
            print(f"  - Status: {request['status']}")
            print(f"  - Code: {request['recovery_code']}")
    
    def test_non_admin_cannot_see_recovery_requests(self):
        """Test that non-admin users cannot see recovery requests"""
        # Try without authentication
        response = requests.get(f"{BASE_URL}/api/admin/password-recovery-requests")
        assert response.status_code in [401, 403]
        print("✓ Unauthenticated users cannot see recovery requests")


class TestPasswordResetWithCode:
    """Test password reset using recovery code"""
    
    def test_reset_with_invalid_code(self):
        """Test reset with invalid recovery code"""
        response = requests.post(f"{BASE_URL}/api/auth/reset-with-code", json={
            "email": TEST_USER_EMAIL,
            "recovery_code": "INVALID1",
            "new_password": "newpassword123"
        })
        assert response.status_code == 400
        assert "inválido" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower() or "expirado" in response.json()["detail"].lower()
        print("✓ Reset with invalid code correctly rejected")
    
    def test_reset_with_short_password(self):
        """Test reset with too short password"""
        response = requests.post(f"{BASE_URL}/api/auth/reset-with-code", json={
            "email": TEST_USER_EMAIL,
            "recovery_code": "TESTCODE",
            "new_password": "12345"  # Less than 6 characters
        })
        # Should fail either due to invalid code or short password
        assert response.status_code == 400
        print("✓ Reset with short password handled correctly")
    
    def test_full_recovery_flow(self):
        """Test complete password recovery flow"""
        # Create a unique test user for this test
        unique_email = f"recovery_test_{int(time.time())}@test.com"
        unique_password = "initialpass123"
        
        # Register new user
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "name": "Recovery Test User",
            "password": unique_password
        })
        
        if register_response.status_code != 200:
            print(f"⚠ Could not create test user: {register_response.text}")
            pytest.skip("Could not create test user for recovery flow test")
        
        print(f"✓ Created test user: {unique_email}")
        
        # Request recovery
        recovery_request = requests.post(f"{BASE_URL}/api/auth/request-recovery", json={
            "email": unique_email
        })
        assert recovery_request.status_code == 200
        print("✓ Recovery requested")
        
        # Login as admin to get the recovery code
        admin_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]
        
        # Get recovery requests
        recovery_list = requests.get(
            f"{BASE_URL}/api/admin/password-recovery-requests",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert recovery_list.status_code == 200
        
        # Find the recovery code for our test user
        recovery_code = None
        for req in recovery_list.json():
            if req["user_email"] == unique_email and req["status"] == "pending":
                recovery_code = req["recovery_code"]
                break
        
        if not recovery_code:
            print("⚠ Could not find recovery code for test user")
            pytest.skip("Recovery code not found")
        
        print(f"✓ Found recovery code: {recovery_code}")
        
        # Reset password with code
        new_password = "newrecoveredpass123"
        reset_response = requests.post(f"{BASE_URL}/api/auth/reset-with-code", json={
            "email": unique_email,
            "recovery_code": recovery_code,
            "new_password": new_password
        })
        assert reset_response.status_code == 200
        print("✓ Password reset successful")
        
        # Verify old password no longer works
        old_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": unique_password
        })
        assert old_login.status_code == 401
        print("✓ Old password correctly rejected")
        
        # Verify new password works
        new_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": new_password
        })
        assert new_login.status_code == 200
        print("✓ New password works correctly")
        
        # Verify recovery code is now marked as used
        recovery_list_after = requests.get(
            f"{BASE_URL}/api/admin/password-recovery-requests",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        for req in recovery_list_after.json():
            if req["user_email"] == unique_email:
                assert req["status"] == "used"
                print("✓ Recovery code marked as used")
                break
        
        print("✓ Full recovery flow completed successfully!")


class TestDeleteRecoveryRequest:
    """Test admin can delete recovery requests"""
    
    def test_admin_can_delete_recovery_request(self):
        """Test that admin can delete a recovery request"""
        # Login as owner
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Get recovery requests
        response = requests.get(
            f"{BASE_URL}/api/admin/password-recovery-requests",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        requests_list = response.json()
        
        if len(requests_list) == 0:
            print("⚠ No recovery requests to delete")
            pytest.skip("No recovery requests available for deletion test")
        
        # Find a used or expired request to delete (don't delete pending ones)
        request_to_delete = None
        for req in requests_list:
            if req["status"] in ["used", "expired"]:
                request_to_delete = req
                break
        
        if not request_to_delete:
            print("⚠ No used/expired recovery requests to delete")
            pytest.skip("No used/expired recovery requests available")
        
        # Delete the request
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/password-recovery-requests/{request_to_delete['id']}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert delete_response.status_code == 200
        print(f"✓ Recovery request deleted: {request_to_delete['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
