#!/usr/bin/env python3
"""Script para criar utilizadores de teste na base de dados IMPAR"""

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
import uuid
from datetime import datetime, timezone

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def create_test_users():
    """Create two test users: one owner and one regular user"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Clear existing test users
        await db.users.delete_many({"email": {"$in": ["owner@test.com", "user@test.com"]}})
        print("✓ Cleared existing test users")
        
        # Create owner user
        owner = {
            "id": str(uuid.uuid4()),
            "email": "owner@test.com",
            "name": "Admin IMPAR",
            "password": hash_password("password123"),
            "role": "owner",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "phone": "+351 912 345 678",
            "date_of_birth": "1985-05-15",
            "gender": "Masculino",
            "nationality": "Portuguesa",
            "district": "Lisboa",
            "municipality": "Lisboa",
            "parish": "Santa Maria Maior",
            "marital_status": "Casado(a)",
            "religion": "Católica",
            "education_level": "Licenciatura",
            "profession": "Jornalista",
            "lived_abroad": False,
            "accept_notifications": True,
            "bio": "Administrador da plataforma IMPAR",
            "avatar_url": None
        }
        
        await db.users.insert_one(owner)
        print(f"✓ Created OWNER user:")
        print(f"  Email: owner@test.com")
        print(f"  Password: password123")
        print(f"  Role: owner")
        
        # Create regular user
        user = {
            "id": str(uuid.uuid4()),
            "email": "user@test.com",
            "name": "João Silva",
            "password": hash_password("password123"),
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "phone": "+351 925 678 901",
            "date_of_birth": "1990-08-20",
            "gender": "Masculino",
            "nationality": "Portuguesa",
            "district": "Porto",
            "municipality": "Porto",
            "parish": "Cedofeita",
            "marital_status": "Solteiro(a)",
            "religion": "Agnóstico",
            "education_level": "Mestrado",
            "profession": "Engenheiro de Software",
            "lived_abroad": True,
            "accept_notifications": True,
            "bio": None,
            "avatar_url": None
        }
        
        await db.users.insert_one(user)
        print(f"\n✓ Created USER:")
        print(f"  Email: user@test.com")
        print(f"  Password: password123")
        print(f"  Role: user")
        
        print("\n" + "="*50)
        print("✓ Test users created successfully!")
        print("="*50)
        print("\nYou can now login with:")
        print("  Owner: owner@test.com / password123")
        print("  User:  user@test.com / password123")
        
    except Exception as e:
        print(f"✗ Error creating test users: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_test_users())
