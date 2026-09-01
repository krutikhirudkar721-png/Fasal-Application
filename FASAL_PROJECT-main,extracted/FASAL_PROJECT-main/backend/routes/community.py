"""
backend/routes/community.py

Community posts — farmers asking questions, sharing crop yields & insights.
Provides create/list/reply functionality, auth-protected for writes,
public for reads (so it's accessible immediately to all farmers).
"""

import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

try:
    from backend.routes.auth import get_current_user
except ImportError:
    from routes.auth import get_current_user

router = APIRouter(prefix="/api/community", tags=["community"])

# Seed data for rich initial experience
_POSTS: List[dict] = [
    {
        "id": 1,
        "authorId": 101,
        "authorName": "Ramesh Patil",
        "authorPhone": "••••••3210",
        "authorDistrict": "Nagpur, MH",
        "title": "Intercropping Soybean with Pigeon Pea (Tur) - Results from last Kharif",
        "body": "I tried 4:2 ratio of Soybean and Tur on 4 acres black soil. Got 11 quintals soybean + 5 quintals tur. Tur took longer to mature but the net return was ₹34,000/acre. Highly recommend trying this crop combination!",
        "crop": "Soybean",
        "imageUrl": None,
        "likes": 24,
        "replies": [
            {
                "id": 1,
                "authorId": 102,
                "authorName": "Sunil Deshmukh",
                "authorPhone": "••••••8841",
                "body": "Did you spray any bio-fungicide during the August rains?",
                "createdAt": time.time() - 3600 * 12,
            },
            {
                "id": 2,
                "authorId": 101,
                "authorName": "Ramesh Patil",
                "authorPhone": "••••••3210",
                "body": "Yes, sprayed Trichoderma viride early morning. No root rot occurred.",
                "createdAt": time.time() - 3600 * 6,
            }
        ],
        "createdAt": time.time() - 86400 * 2,
    },
    {
        "id": 2,
        "authorId": 103,
        "authorName": "Balwant Singh",
        "authorPhone": "••••••5120",
        "authorDistrict": "Ludhiana, PB",
        "title": "Best sowing date for HD-3086 Wheat in sandy loam soil",
        "body": "Last year sowing in first week of November gave 22 quintals/acre with 4 irrigations. Anyone trying Happy Seeder with direct residue?",
        "crop": "Wheat",
        "imageUrl": None,
        "likes": 18,
        "replies": [
            {
                "id": 3,
                "authorId": 104,
                "authorName": "Gurmeet K.",
                "authorPhone": "••••••7732",
                "body": "Happy Seeder saves ₹2000/acre on diesel and retains moisture well.",
                "createdAt": time.time() - 3600 * 8,
            }
        ],
        "createdAt": time.time() - 86400 * 3,
    },
    {
        "id": 3,
        "authorId": 105,
        "authorName": "Kishore Kumar",
        "authorPhone": "••••••9920",
        "authorDistrict": "Yavatmal, MH",
        "title": "Pink Bollworm pheromone traps in Bt Cotton - 50 days report",
        "body": "Installed 8 traps per acre in July. Caught over 60 moths before mating peak. Foliar damage is under 3% so far compared to 20% last year.",
        "crop": "Cotton",
        "imageUrl": None,
        "likes": 31,
        "replies": [],
        "createdAt": time.time() - 86400 * 4,
    }
]


class PostInput(BaseModel):
    title: str
    body: str
    crop: Optional[str] = None
    imageUrl: Optional[str] = None


class ReplyInput(BaseModel):
    body: str


@router.get("")
def list_posts(crop: Optional[str] = None):
    posts = _POSTS
    if crop and crop.lower() != "all":
        posts = [p for p in posts if p.get("crop", "").lower() == crop.lower()]
    return sorted(posts, key=lambda p: p["createdAt"], reverse=True)


@router.post("")
def create_post(body: PostInput, user: dict = Depends(get_current_user)):
    user_phone = str(user.get("phone", "9999"))
    masked_phone = "••••••" + user_phone[-4:] if len(user_phone) >= 4 else "••••••"
    
    post = {
        "id": len(_POSTS) + 1,
        "authorId": user["id"],
        "authorName": user.get("name", f"Farmer {user_phone[-4:]}"),
        "authorPhone": masked_phone,
        "authorDistrict": f"{user.get('district', 'Nagpur')}, {user.get('state', 'MH')}",
        **body.dict(),
        "likes": 0,
        "replies": [],
        "createdAt": time.time(),
    }
    _POSTS.append(post)
    return post


@router.post("/{post_id}/reply")
def reply_to_post(post_id: int, body: ReplyInput, user: dict = Depends(get_current_user)):
    post = next((p for p in _POSTS if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    user_phone = str(user.get("phone", "9999"))
    masked_phone = "••••••" + user_phone[-4:] if len(user_phone) >= 4 else "••••••"

    reply = {
        "id": len(post["replies"]) + 1,
        "authorId": user["id"],
        "authorName": user.get("name", f"Farmer {user_phone[-4:]}"),
        "authorPhone": masked_phone,
        "body": body.body,
        "createdAt": time.time(),
    }
    post["replies"].append(reply)
    return post


@router.post("/{post_id}/like")
def like_post(post_id: int):
    post = next((p for p in _POSTS if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post["likes"] = post.get("likes", 0) + 1
    return {"success": True, "likes": post["likes"]}
