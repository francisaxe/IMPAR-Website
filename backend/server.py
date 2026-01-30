from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'impar-super-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Create the main app
app = FastAPI(title="IMPAR Survey API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    district: Optional[str] = None
    municipality: Optional[str] = None
    parish: Optional[str] = None
    marital_status: Optional[str] = None
    religion: Optional[str] = None
    education_level: Optional[str] = None
    profession: Optional[str] = None
    lived_abroad: Optional[bool] = None
    accept_notifications: Optional[bool] = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: Literal["user", "admin", "owner"] = "user"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    district: Optional[str] = None
    municipality: Optional[str] = None
    parish: Optional[str] = None
    marital_status: Optional[str] = None
    religion: Optional[str] = None
    education_level: Optional[str] = None
    profession: Optional[str] = None
    lived_abroad: Optional[bool] = None
    accept_notifications: Optional[bool] = False

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    district: Optional[str] = None
    municipality: Optional[str] = None
    parish: Optional[str] = None
    marital_status: Optional[str] = None
    religion: Optional[str] = None
    education_level: Optional[str] = None
    profession: Optional[str] = None
    lived_abroad: Optional[bool] = None
    accept_notifications: Optional[bool] = False

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

# Question Models
class QuestionOption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    order: int = 0

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["multiple_choice", "text", "rating", "yes_no", "checkbox"]
    text: str
    required: bool = True
    highlighted: bool = False
    options: Optional[List[QuestionOption]] = None
    min_rating: Optional[int] = 1
    max_rating: Optional[int] = 5
    order: int = 0

class QuestionCreate(BaseModel):
    type: Literal["multiple_choice", "text", "rating", "yes_no", "checkbox"]
    text: str
    required: bool = True
    highlighted: bool = False
    options: Optional[List[dict]] = None
    min_rating: Optional[int] = 1
    max_rating: Optional[int] = 5
    order: int = 0

# Survey Models
class SurveyBase(BaseModel):
    title: str
    description: Optional[str] = None

class SurveyCreate(SurveyBase):
    questions: List[QuestionCreate] = []
    is_featured: bool = False
    end_date: Optional[str] = None

class Survey(SurveyBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    questions: List[Question] = []
    is_published: bool = False
    is_featured: bool = False
    end_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    response_count: int = 0

class SurveyResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    owner_id: str
    owner_name: Optional[str] = None
    questions: List[Question]
    is_published: bool
    is_featured: bool
    end_date: Optional[str] = None
    created_at: str
    updated_at: str
    response_count: int
    user_has_responded: bool = False
    survey_number: Optional[int] = None

class SurveyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    questions: Optional[List[QuestionCreate]] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None

# Response Models
class Answer(BaseModel):
    question_id: str
    value: str  # For text/rating or option_id for multiple choice

class SurveyAnswerCreate(BaseModel):
    answers: List[Answer]

class SurveyAnswer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    survey_id: str
    user_id: Optional[str] = None
    answers: List[Answer]
    submitted_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Suggestion Models
class SuggestionCreate(BaseModel):
    content: str
    survey_id: Optional[str] = None

class Suggestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: Optional[str] = None
    content: str
    survey_id: Optional[str] = None
    status: Literal["pending", "reviewed", "implemented", "rejected"] = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Team Application Models
class TeamApplicationCreate(BaseModel):
    message: str

class TeamApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    message: str
    status: Literal["pending", "reviewed", "accepted", "rejected"] = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ===================== AUTH HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)) -> Optional[dict]:
    """Retorna o utilizador se autenticado, None caso contrário"""
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        return user
    except:
        return None

# ===================== AUTH ROUTES =====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if there's already an owner
    existing_owner = await db.users.find_one({"role": "owner"})
    role = "owner" if not existing_owner else "user"
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=role,
        phone=user_data.phone,
        date_of_birth=user_data.date_of_birth,
        gender=user_data.gender,
        nationality=user_data.nationality,
        district=user_data.district,
        municipality=user_data.municipality,
        parish=user_data.parish,
        marital_status=user_data.marital_status,
        religion=user_data.religion,
        education_level=user_data.education_level,
        profession=user_data.profession,
        lived_abroad=user_data.lived_abroad,
        accept_notifications=user_data.accept_notifications
    )
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id, user.email, user.role)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            bio=user.bio,
            avatar_url=user.avatar_url,
            created_at=user.created_at,
            phone=user.phone,
            date_of_birth=user.date_of_birth,
            gender=user.gender,
            nationality=user.nationality,
            district=user.district,
            municipality=user.municipality,
            parish=user.parish,
            marital_status=user.marital_status,
            religion=user.religion,
            education_level=user.education_level,
            profession=user.profession,
            lived_abroad=user.lived_abroad,
            accept_notifications=user.accept_notifications
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["role"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            bio=user.get("bio"),
            avatar_url=user.get("avatar_url"),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

@api_router.put("/auth/profile", response_model=UserResponse)
async def update_profile(update: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password": 0})
    return UserResponse(**updated_user)

# ===================== SURVEY ROUTES =====================

@api_router.post("/surveys", response_model=SurveyResponse)
async def create_survey(survey_data: SurveyCreate, current_user: dict = Depends(get_admin_user)):
    # Apenas admins/owners podem criar sondagens
    questions = []
    for i, q in enumerate(survey_data.questions):
        q_dict = q.model_dump()
        q_dict["id"] = str(uuid.uuid4())
        q_dict["order"] = i
        if q.options:
            q_dict["options"] = [
                {"id": str(uuid.uuid4()), "text": opt.get("text", ""), "order": j}
                for j, opt in enumerate(q.options)
            ]
        questions.append(Question(**q_dict))
    
    survey = Survey(
        title=survey_data.title,
        description=survey_data.description,
        owner_id=current_user["id"],
        questions=questions,
        is_featured=survey_data.is_featured,
        end_date=survey_data.end_date
    )
    
    await db.surveys.insert_one(survey.model_dump())
    
    return SurveyResponse(
        **survey.model_dump(),
        owner_name=current_user["name"]
    )

@api_router.get("/surveys", response_model=List[SurveyResponse])
async def get_surveys(
    featured: Optional[bool] = None,
    published: Optional[bool] = None,
    owner_id: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    query = {}
    if featured is not None:
        query["is_featured"] = featured
    if published is not None:
        query["is_published"] = published
    if owner_id:
        query["owner_id"] = owner_id
    
    # Ordenar por data de criação (mais recente primeiro)
    surveys = await db.surveys.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    result = []
    for s in surveys:
        owner = await db.users.find_one({"id": s["owner_id"]}, {"_id": 0, "name": 1})
        s["owner_name"] = owner["name"] if owner else None
        
        # Adicionar flag se o utilizador já respondeu
        if current_user:
            response = await db.responses.find_one({
                "survey_id": s["id"],
                "user_id": current_user["id"]
            }, {"_id": 0})
            s["user_has_responded"] = response is not None
        else:
            s["user_has_responded"] = False
            
        result.append(SurveyResponse(**s))
    
    return result

@api_router.get("/surveys/my", response_model=List[SurveyResponse])
async def get_my_surveys(current_user: dict = Depends(get_current_user)):
    surveys = await db.surveys.find({"owner_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return [SurveyResponse(**s, owner_name=current_user["name"]) for s in surveys]

@api_router.get("/surveys/{survey_id}", response_model=SurveyResponse)
async def get_survey(survey_id: str):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    owner = await db.users.find_one({"id": survey["owner_id"]}, {"_id": 0, "name": 1})
    survey["owner_name"] = owner["name"] if owner else None
    
    return SurveyResponse(**survey)

@api_router.put("/surveys/{survey_id}", response_model=SurveyResponse)
async def update_survey(survey_id: str, update: SurveyUpdate, current_user: dict = Depends(get_current_user)):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    if survey["owner_id"] != current_user["id"] and current_user["role"] not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {}
    if update.title is not None:
        update_data["title"] = update.title
    if update.description is not None:
        update_data["description"] = update.description
    if update.is_published is not None:
        update_data["is_published"] = update.is_published
    if update.is_featured is not None and current_user["role"] in ["admin", "owner"]:
        update_data["is_featured"] = update.is_featured
    if update.questions is not None:
        questions = []
        for i, q in enumerate(update.questions):
            q_dict = q.model_dump()
            q_dict["id"] = str(uuid.uuid4())
            q_dict["order"] = i
            if q.options:
                q_dict["options"] = [
                    {"id": str(uuid.uuid4()), "text": opt.get("text", ""), "order": j}
                    for j, opt in enumerate(q.options)
                ]
            questions.append(q_dict)
        update_data["questions"] = questions
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.surveys.update_one({"id": survey_id}, {"$set": update_data})
    
    updated = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    return SurveyResponse(**updated, owner_name=current_user["name"])

@api_router.delete("/surveys/{survey_id}")
async def delete_survey(survey_id: str, current_user: dict = Depends(get_current_user)):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    if survey["owner_id"] != current_user["id"] and current_user["role"] not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.surveys.delete_one({"id": survey_id})
    await db.responses.delete_many({"survey_id": survey_id})
    
    return {"message": "Survey deleted"}

@api_router.put("/surveys/{survey_id}/toggle-featured")
async def toggle_survey_featured(survey_id: str, admin: dict = Depends(get_admin_user)):
    """Toggle is_featured status (apenas admins)"""
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    new_featured_status = not survey.get("is_featured", False)
    await db.surveys.update_one(
        {"id": survey_id}, 
        {"$set": {"is_featured": new_featured_status}}
    )
    
    return {"message": "Featured status updated", "is_featured": new_featured_status}

# ===================== RESPONSE ROUTES =====================

@api_router.post("/surveys/{survey_id}/respond", response_model=SurveyAnswer)
async def submit_response(
    survey_id: str,
    response_data: SurveyAnswerCreate,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    if not survey.get("is_published"):
        raise HTTPException(status_code=400, detail="Survey is not published")
    
    answer = SurveyAnswer(
        survey_id=survey_id,
        user_id=current_user["id"] if current_user else None,
        answers=response_data.answers
    )
    
    await db.responses.insert_one(answer.model_dump())
    await db.surveys.update_one({"id": survey_id}, {"$inc": {"response_count": 1}})
    
    return answer

@api_router.get("/surveys/{survey_id}/responses", response_model=List[SurveyAnswer])
async def get_survey_responses(survey_id: str, current_user: dict = Depends(get_current_user)):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    if survey["owner_id"] != current_user["id"] and current_user["role"] not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Ordenar por data (última resposta primeiro)
    responses = await db.responses.find({"survey_id": survey_id}, {"_id": 0}).sort("submitted_at", -1).to_list(1000)
    return [SurveyAnswer(**r) for r in responses]

@api_router.get("/my-responses")
async def get_my_responses(current_user: dict = Depends(get_current_user)):
    """Retorna todas as respostas do utilizador com resultados globais em %"""
    responses = await db.responses.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("submitted_at", -1).to_list(1000)
    
    result = []
    for response in responses:
        # Buscar informações da sondagem
        survey = await db.surveys.find_one({"id": response["survey_id"]}, {"_id": 0})
        if not survey:
            continue
            
        # Calcular resultados globais em %
        all_responses = await db.responses.find({"survey_id": response["survey_id"]}, {"_id": 0}).to_list(10000)
        total_responses = len(all_responses)
        
        global_results = {}
        for question in survey.get("questions", []):
            q_id = question["id"]
            q_type = question["type"]
            
            if q_type in ["multiple_choice", "yes_no"]:
                option_counts = {}
                for resp in all_responses:
                    for ans in resp.get("answers", []):
                        if ans["question_id"] == q_id:
                            value = ans["value"]
                            option_counts[value] = option_counts.get(value, 0) + 1
                
                # Calcular percentagens
                option_percentages = {}
                for opt_id, count in option_counts.items():
                    percentage = (count / total_responses * 100) if total_responses > 0 else 0
                    option_percentages[opt_id] = round(percentage, 1)
                
                global_results[q_id] = {
                    "type": q_type,
                    "percentages": option_percentages
                }
                
            elif q_type == "rating":
                ratings = []
                for resp in all_responses:
                    for ans in resp.get("answers", []):
                        if ans["question_id"] == q_id:
                            try:
                                ratings.append(int(ans["value"]))
                            except:
                                pass
                
                avg_rating = sum(ratings) / len(ratings) if ratings else 0
                global_results[q_id] = {
                    "type": q_type,
                    "average": round(avg_rating, 1),
                    "total_votes": len(ratings)
                }
        
        result.append({
            "response": response,
            "survey": {
                "id": survey["id"],
                "title": survey["title"],
                "description": survey.get("description"),
                "questions": survey["questions"]
            },
            "global_results": global_results,
            "total_responses": total_responses
        })
    
    return result

@api_router.get("/surveys/{survey_id}/analytics")
async def get_survey_analytics(survey_id: str, current_user: dict = Depends(get_current_user)):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    if survey["owner_id"] != current_user["id"] and current_user["role"] not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    responses = await db.responses.find({"survey_id": survey_id}, {"_id": 0}).to_list(1000)
    
    analytics = {
        "total_responses": len(responses),
        "questions": {}
    }
    
    for question in survey.get("questions", []):
        q_id = question["id"]
        q_type = question["type"]
        q_analytics = {"type": q_type, "responses": []}
        
        for resp in responses:
            for ans in resp.get("answers", []):
                if ans["question_id"] == q_id:
                    q_analytics["responses"].append(ans["value"])
        
        if q_type == "multiple_choice":
            option_counts = {}
            for opt in question.get("options", []):
                option_counts[opt["id"]] = {"text": opt["text"], "count": 0}
            for val in q_analytics["responses"]:
                if val in option_counts:
                    option_counts[val]["count"] += 1
            q_analytics["option_breakdown"] = option_counts
        elif q_type == "rating":
            ratings = [int(r) for r in q_analytics["responses"] if r.isdigit()]
            q_analytics["average"] = sum(ratings) / len(ratings) if ratings else 0
            q_analytics["distribution"] = {str(i): ratings.count(i) for i in range(1, 6)}
        
        analytics["questions"][q_id] = q_analytics
    
    return analytics

# Public endpoint for viewing results (percentages only, no text responses)
@api_router.get("/surveys/{survey_id}/public-results")
async def get_public_survey_results(survey_id: str):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    if not survey.get("is_published"):
        raise HTTPException(status_code=400, detail="Survey is not published")
    
    responses = await db.responses.find({"survey_id": survey_id}, {"_id": 0}).to_list(1000)
    
    analytics = {
        "total_responses": len(responses),
        "questions": {}
    }
    
    for question in survey.get("questions", []):
        q_id = question["id"]
        q_type = question["type"]
        total_answers = 0
        q_analytics = {"type": q_type}
        
        answer_values = []
        for resp in responses:
            for ans in resp.get("answers", []):
                if ans["question_id"] == q_id:
                    answer_values.append(ans["value"])
                    total_answers += 1
        
        q_analytics["total_answers"] = total_answers
        
        if q_type == "multiple_choice":
            option_counts = {}
            for opt in question.get("options", []):
                option_counts[opt["id"]] = {"text": opt["text"], "count": 0}
            for val in answer_values:
                if val in option_counts:
                    option_counts[val]["count"] += 1
            q_analytics["option_breakdown"] = option_counts
        elif q_type == "yes_no":
            yes_count = answer_values.count("Sim")
            no_count = answer_values.count("Não")
            q_analytics["yes_count"] = yes_count
            q_analytics["no_count"] = no_count
            q_analytics["yes_percentage"] = (yes_count / total_answers * 100) if total_answers > 0 else 0
            q_analytics["no_percentage"] = (no_count / total_answers * 100) if total_answers > 0 else 0
        elif q_type == "checkbox":
            option_counts = {}
            for opt in question.get("options", []):
                option_counts[opt["id"]] = {"text": opt["text"], "count": 0}
            for val in answer_values:
                selected = val.split(',')
                for opt_id in selected:
                    if opt_id in option_counts:
                        option_counts[opt_id]["count"] += 1
            q_analytics["option_breakdown"] = option_counts
        elif q_type == "rating":
            ratings = [int(r) for r in answer_values if r.isdigit()]
            q_analytics["average"] = sum(ratings) / len(ratings) if ratings else 0
            max_rating = question.get("max_rating", 5)
            min_rating = question.get("min_rating", 1)
            q_analytics["distribution"] = {str(i): ratings.count(i) for i in range(min_rating, max_rating + 1)}
        elif q_type == "text":
            # Don't expose text responses, just count
            q_analytics["response_count"] = total_answers
        
        analytics["questions"][q_id] = q_analytics
    
    return analytics

# ===================== ADMIN ROUTES =====================

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: Literal["user", "admin"], admin: dict = Depends(get_admin_user)):
    if admin["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owner can change roles")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["role"] == "owner":
        raise HTTPException(status_code=400, detail="Cannot change owner role")
    
    await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    return {"message": f"User role updated to {role}"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    if admin["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owner can delete users")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["role"] == "owner":
        raise HTTPException(status_code=400, detail="Cannot delete owner")
    
    await db.users.delete_one({"id": user_id})
    return {"message": "User deleted"}

# ===================== SUGGESTION ROUTES =====================

@api_router.post("/suggestions", response_model=Suggestion)
async def create_suggestion(data: SuggestionCreate, current_user: dict = Depends(get_current_user)):
    suggestion = Suggestion(
        user_id=current_user["id"],
        user_name=current_user["name"],
        content=data.content,
        survey_id=data.survey_id
    )
    await db.suggestions.insert_one(suggestion.model_dump())
    return suggestion

@api_router.get("/suggestions", response_model=List[Suggestion])
async def get_suggestions(admin: dict = Depends(get_admin_user)):
    suggestions = await db.suggestions.find({}, {"_id": 0}).to_list(1000)
    return [Suggestion(**s) for s in suggestions]

@api_router.put("/suggestions/{suggestion_id}/status")
async def update_suggestion_status(
    suggestion_id: str,
    status: Literal["pending", "reviewed", "implemented", "rejected"],
    admin: dict = Depends(get_admin_user)
):
    suggestion = await db.suggestions.find_one({"id": suggestion_id}, {"_id": 0})
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    await db.suggestions.update_one({"id": suggestion_id}, {"$set": {"status": status}})
    return {"message": f"Suggestion status updated to {status}"}

@api_router.delete("/suggestions/{suggestion_id}")
async def delete_suggestion(suggestion_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.suggestions.delete_one({"id": suggestion_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    return {"message": "Suggestion deleted"}

# ===================== TEAM APPLICATIONS =====================

@api_router.post("/team-applications", response_model=TeamApplication)
async def create_team_application(data: TeamApplicationCreate, current_user: dict = Depends(get_current_user)):
    # Check if user already has a pending application
    existing = await db.team_applications.find_one({
        "user_id": current_user["id"],
        "status": "pending"
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Já tem uma candidatura pendente. Aguarde a análise do administrador."
        )
    
    application = TeamApplication(
        user_id=current_user["id"],
        user_name=current_user["name"],
        user_email=current_user["email"],
        message=data.message
    )
    await db.team_applications.insert_one(application.model_dump())
    return application

@api_router.get("/team-applications", response_model=List[TeamApplication])
async def get_team_applications(admin: dict = Depends(get_admin_user)):
    applications = await db.team_applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [TeamApplication(**app) for app in applications]

@api_router.put("/team-applications/{application_id}/status")
async def update_team_application_status(
    application_id: str,
    status: Literal["pending", "reviewed", "accepted", "rejected"],
    admin: dict = Depends(get_admin_user)
):
    application = await db.team_applications.find_one({"id": application_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    await db.team_applications.update_one({"id": application_id}, {"$set": {"status": status}})
    return {"message": f"Application status updated to {status}"}

@api_router.delete("/team-applications/{application_id}")
async def delete_team_application(application_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.team_applications.delete_one({"id": application_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted"}


# ===================== HEALTH CHECK =====================

@api_router.get("/")
async def root():
    return {"message": "IMPAR Survey API", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
