"""
FakeGuard AI - Model Training Engine
====================================
Academic Prototype: Fake Follower Detection System Using Machine Learning
Algorithm: Scikit-learn Pipeline (Median Imputer + Random Forest Classifier)

DISCLAIMER:
-----------
This training script uses a synthetic demonstration dataset designed to reflect
patterns commonly observed in social media accounts (e.g., bot farms, mass-follow bots,
dormant accounts, and authentic organic profiles).
Synthetic performance metrics do not constitute proof of real-world generalization
or real-world accuracy. A representative, ethically sourced and labeled real-world dataset
is required for production deployment.
"""

import os
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import joblib

# The 9 mandatory numeric features used by the model
FEATURE_COLUMNS = [
    "account_age_days",
    "followers_count",
    "following_count",
    "posts_count",
    "avg_likes",
    "avg_comments",
    "has_profile_pic",
    "bio_length",
    "repetitive_comments"
]

def generate_synthetic_data(n_samples=2500, random_state=42):
    """
    Generate synthetic account data representing authentic and suspicious accounts.
    
    Authentic Accounts (Label = 0):
      - Established account age (several months to years)
      - Balanced or organic follower/following ratios
      - Consistent posts with healthy like/comment engagement rates (~1% to 10%)
      - Almost always has profile photo (>98%)
      - Natural bio lengths (10-150 characters)
      - Very low repetitive/spam comments (0-1)

    Suspicious / Fake Accounts (Label = 1):
      - Often brand new accounts or dormant spikes
      - Extreme follower-to-following imbalances (e.g., following 2000+, followers < 50)
      - Ghost engagement: high followers but 0 or negligible likes/comments, or 0 posts
      - High proportion of missing profile photos (~40-60%)
      - Empty or extremely short bios
      - High repetitive comment counts (automated bot comments)
    """
    np.random.seed(random_state)
    n_legit = n_samples // 2
    n_suspicious = n_samples - n_legit

    # --- 1. Authentic Accounts (Class 0) ---
    legit_age = np.random.gamma(shape=3.0, scale=300, size=n_legit) + 60
    legit_followers = np.random.exponential(scale=1800, size=n_legit) + 80
    legit_following = legit_followers * np.random.uniform(0.15, 0.95, size=n_legit) + np.random.normal(50, 20, size=n_legit)
    legit_following = np.clip(legit_following, 10, 4000)
    legit_posts = np.random.poisson(lam=65, size=n_legit) + 5
    
    # Healthy engagement: 2% to 8% like rate, 0.1% to 1% comment rate
    like_rate = np.random.uniform(0.02, 0.09, size=n_legit)
    comment_rate = np.random.uniform(0.002, 0.015, size=n_legit)
    legit_avg_likes = np.clip(legit_followers * like_rate, 1, 10000)
    legit_avg_comments = np.clip(legit_followers * comment_rate, 0, 500)
    
    legit_has_pic = np.random.choice([1, 0], size=n_legit, p=[0.985, 0.015])
    legit_bio_len = np.random.normal(loc=75, scale=35, size=n_legit).clip(5, 150)
    legit_repetitive_comments = np.random.choice([0, 1, 2], size=n_legit, p=[0.88, 0.10, 0.02])

    df_legit = pd.DataFrame({
        "account_age_days": np.round(legit_age),
        "followers_count": np.round(legit_followers),
        "following_count": np.round(legit_following),
        "posts_count": np.round(legit_posts),
        "avg_likes": np.round(legit_avg_likes, 1),
        "avg_comments": np.round(legit_avg_comments, 1),
        "has_profile_pic": legit_has_pic,
        "bio_length": np.round(legit_bio_len),
        "repetitive_comments": legit_repetitive_comments,
        "is_fake": 0
    })

    # --- 2. Suspicious Accounts (Class 1) ---
    # Subtype A: Mass follow bot (new, following thousands, zero engagement)
    # Subtype B: Purchased follower / ghost account (high followers, 0 likes, no posts)
    # Subtype C: Spam comment bot (elevated repetitive comments, fresh account)
    susp_types = np.random.choice(["mass_follow", "ghost", "spam_bot"], size=n_suspicious, p=[0.45, 0.30, 0.25])
    
    susp_age = []
    susp_followers = []
    susp_following = []
    susp_posts = []
    susp_likes = []
    susp_comments = []
    susp_pic = []
    susp_bio = []
    susp_rep_comments = []

    for st in susp_types:
        if st == "mass_follow":
            age = np.random.uniform(1, 45)
            followers = np.random.uniform(5, 120)
            following = np.random.uniform(800, 5000)
            posts = np.random.choice([0, 1, 2, 3], p=[0.4, 0.3, 0.2, 0.1])
            likes = np.random.uniform(0, 3)
            comments = np.random.uniform(0, 1)
            pic = np.random.choice([0, 1], p=[0.45, 0.55])
            bio = np.random.choice([0, 5, 15], p=[0.5, 0.3, 0.2])
            rep = np.random.choice([0, 1, 2, 4], p=[0.4, 0.3, 0.2, 0.1])
        elif st == "ghost":
            age = np.random.uniform(20, 400)
            followers = np.random.uniform(2000, 30000)
            following = np.random.uniform(10, 150)
            posts = np.random.choice([0, 1, 4], p=[0.5, 0.3, 0.2])
            likes = np.random.uniform(0, 8)  # Abnormally low for thousands of followers
            comments = np.random.uniform(0, 1)
            pic = np.random.choice([0, 1], p=[0.60, 0.40])
            bio = np.random.choice([0, 8, 20], p=[0.6, 0.25, 0.15])
            rep = np.random.choice([0, 1], p=[0.7, 0.3])
        else: # spam_bot
            age = np.random.uniform(5, 90)
            followers = np.random.uniform(15, 300)
            following = np.random.uniform(400, 2500)
            posts = np.random.poisson(lam=8)
            likes = np.random.uniform(0, 5)
            comments = np.random.uniform(0, 2)
            pic = np.random.choice([0, 1], p=[0.35, 0.65])
            bio = np.random.uniform(0, 30)
            rep = np.random.choice([3, 4, 6, 8, 12], p=[0.3, 0.3, 0.2, 0.1, 0.1])
            
        susp_age.append(age)
        susp_followers.append(followers)
        susp_following.append(following)
        susp_posts.append(posts)
        susp_likes.append(likes)
        susp_comments.append(comments)
        susp_pic.append(pic)
        susp_bio.append(bio)
        susp_rep_comments.append(rep)

    df_susp = pd.DataFrame({
        "account_age_days": np.round(susp_age),
        "followers_count": np.round(susp_followers),
        "following_count": np.round(susp_following),
        "posts_count": np.round(susp_posts),
        "avg_likes": np.round(susp_likes, 1),
        "avg_comments": np.round(susp_comments, 1),
        "has_profile_pic": susp_pic,
        "bio_length": np.round(susp_bio),
        "repetitive_comments": susp_rep_comments,
        "is_fake": 1
    })

    df = pd.concat([df_legit, df_susp], ignore_index=True)
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df

def build_and_train_pipeline(data_df):
    """
    Builds Scikit-learn Pipeline with:
      - Median Imputer
      - Random Forest Classifier
    
    Methodological Note on Missing Values:
    -------------------------------------
    Per project specifications:
    The prototype CSV preprocessing stage explicitly fills missing numeric values
    with zero prior to model inference. However, the model pipeline itself encapsulates
    a SimpleImputer(strategy='median') as a defensive safeguard against unexpected NaN
    inputs during model serialization or raw API invocation.
    """
    X = data_df[FEATURE_COLUMNS]
    y = data_df["is_fake"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("classifier", RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            class_weight="balanced"
        ))
    ])

    print("Training Random Forest Pipeline on synthetic demonstration dataset...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_prob)

    print("\n--- Synthetic Model Evaluation (Demonstration Only) ---")
    print(f"ROC-AUC Score on synthetic holdout: {auc:.4f}")
    print(classification_report(y_test, y_pred, target_names=["Authentic", "Suspicious"]))
    print("NOTE: These metrics reflect synthetic demonstration performance only.")
    print("Do not present them as empirical proof of real-world Instagram accuracy.\n")

    return pipeline

def create_sample_csv(target_path):
    """
    Generates a realistic sample CSV with 20 accounts (both authentic, borderline,
    and highly suspicious) to allow immediate demonstration and testing.
    Includes the exact 10 required columns.
    """
    samples = [
        # Authentic accounts (Low Risk)
        {"username": "travel_with_maya", "account_age_days": 1240, "followers_count": 4820, "following_count": 612, "posts_count": 210, "avg_likes": 320.5, "avg_comments": 24.2, "has_profile_pic": 1, "bio_length": 95, "repetitive_comments": 0},
        {"username": "dev_alex_tech", "account_age_days": 890, "followers_count": 1540, "following_count": 430, "posts_count": 78, "avg_likes": 88.0, "avg_comments": 12.5, "has_profile_pic": 1, "bio_length": 112, "repetitive_comments": 0},
        {"username": "urban_gardens_sf", "account_age_days": 650, "followers_count": 2980, "following_count": 510, "posts_count": 145, "avg_likes": 194.2, "avg_comments": 19.8, "has_profile_pic": 1, "bio_length": 68, "repetitive_comments": 0},
        {"username": "chef_marcus_k", "account_age_days": 1420, "followers_count": 12800, "following_count": 890, "posts_count": 430, "avg_likes": 980.0, "avg_comments": 65.0, "has_profile_pic": 1, "bio_length": 130, "repetitive_comments": 1},
        {"username": "fitness_clara", "account_age_days": 510, "followers_count": 3120, "following_count": 720, "posts_count": 118, "avg_likes": 210.0, "avg_comments": 16.4, "has_profile_pic": 1, "bio_length": 82, "repetitive_comments": 0},
        {"username": "art_by_sophia", "account_age_days": 730, "followers_count": 1890, "following_count": 340, "posts_count": 92, "avg_likes": 145.0, "avg_comments": 14.1, "has_profile_pic": 1, "bio_length": 74, "repetitive_comments": 0},
        {"username": "coffee_stories_daily", "account_age_days": 980, "followers_count": 6400, "following_count": 910, "posts_count": 305, "avg_likes": 412.5, "avg_comments": 31.0, "has_profile_pic": 1, "bio_length": 105, "repetitive_comments": 0},
        
        # Borderline accounts (Medium Risk)
        {"username": "crypto_daily_alpha", "account_age_days": 95, "followers_count": 1250, "following_count": 1100, "posts_count": 22, "avg_likes": 18.0, "avg_comments": 3.2, "has_profile_pic": 1, "bio_length": 35, "repetitive_comments": 2},
        {"username": "vintage_finds_now", "account_age_days": 140, "followers_count": 850, "following_count": 980, "posts_count": 14, "avg_likes": 12.5, "avg_comments": 1.8, "has_profile_pic": 1, "bio_length": 22, "repetitive_comments": 1},
        {"username": "growth_hacker_77", "account_age_days": 62, "followers_count": 2400, "following_count": 2800, "posts_count": 31, "avg_likes": 28.0, "avg_comments": 4.1, "has_profile_pic": 1, "bio_length": 45, "repetitive_comments": 2},
        {"username": "street_beats_music", "account_age_days": 180, "followers_count": 1650, "following_count": 1720, "posts_count": 19, "avg_likes": 22.0, "avg_comments": 2.5, "has_profile_pic": 0, "bio_length": 18, "repetitive_comments": 1},
        {"username": "quick_tips_hub", "account_age_days": 85, "followers_count": 920, "following_count": 1050, "posts_count": 16, "avg_likes": 14.0, "avg_comments": 2.0, "has_profile_pic": 1, "bio_length": 28, "repetitive_comments": 2},

        # Suspicious / Bot accounts (High Risk)
        {"username": "follow_boost_9921", "account_age_days": 6, "followers_count": 18, "following_count": 3450, "posts_count": 0, "avg_likes": 0.0, "avg_comments": 0.0, "has_profile_pic": 0, "bio_length": 0, "repetitive_comments": 5},
        {"username": "user839218204", "account_age_days": 12, "followers_count": 42, "following_count": 4120, "posts_count": 1, "avg_likes": 0.5, "avg_comments": 0.0, "has_profile_pic": 0, "bio_length": 0, "repetitive_comments": 4},
        {"username": "promo_dm_fast_free", "account_age_days": 19, "followers_count": 110, "following_count": 4900, "posts_count": 3, "avg_likes": 1.2, "avg_comments": 0.1, "has_profile_pic": 1, "bio_length": 12, "repetitive_comments": 7},
        {"username": "crypto_giveaway_bot", "account_age_days": 8, "followers_count": 65, "following_count": 3950, "posts_count": 2, "avg_likes": 0.8, "avg_comments": 0.0, "has_profile_pic": 0, "bio_length": 8, "repetitive_comments": 9},
        {"username": "insta_growth_guru4", "account_age_days": 15, "followers_count": 92, "following_count": 4200, "posts_count": 1, "avg_likes": 0.2, "avg_comments": 0.0, "has_profile_pic": 0, "bio_length": 5, "repetitive_comments": 6},
        {"username": "viral_clips_blast", "account_age_days": 24, "followers_count": 14500, "following_count": 65, "posts_count": 2, "avg_likes": 3.0, "avg_comments": 0.2, "has_profile_pic": 0, "bio_length": 0, "repetitive_comments": 3},
        {"username": "free_followers_now", "account_age_days": 4, "followers_count": 22, "following_count": 3100, "posts_count": 0, "avg_likes": 0.0, "avg_comments": 0.0, "has_profile_pic": 0, "bio_length": 0, "repetitive_comments": 8},
        {"username": "rich_lifestyle_99x", "account_age_days": 18, "followers_count": 12000, "following_count": 85, "posts_count": 4, "avg_likes": 4.5, "avg_comments": 0.1, "has_profile_pic": 1, "bio_length": 15, "repetitive_comments": 4}
    ]

    df_sample = pd.DataFrame(samples)
    df_sample.to_csv(target_path, index=False)
    print(f"Sample demonstration CSV successfully written to: {target_path}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base_dir, "models")
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)

    model_path = os.path.join(model_dir, "random_forest_model.pkl")
    sample_csv_path = os.path.join(data_dir, "sample_followers.csv")

    # 1. Generate synthetic demonstration dataset
    synthetic_df = generate_synthetic_data(n_samples=3000, random_state=42)

    # 2. Train Random Forest pipeline
    pipeline = build_and_train_pipeline(synthetic_df)

    # 3. Save model using Joblib
    joblib.dump(pipeline, model_path)
    print(f"Model successfully saved to: {model_path}")

    # 4. Generate demonstration sample CSV
    create_sample_csv(sample_csv_path)

if __name__ == "__main__":
    main()
