"""
FakeGuard AI - Comprehensive Automated Test Suite
==================================================
Tests every requirement across Phase 1 to Phase 5:
  1. Model pipeline integrity and exact 9 numeric features
  2. Exact risk threshold categorization (<40% Low, 40-70% Med, >=70% High)
  3. Rule-based warning signals independent evaluation
  4. Flask API endpoints (/api/sample, /api/analyze, /api/export, /api/health)
  5. Validation testing:
     - Valid CSV
     - Missing required columns
     - Empty CSV
     - Negative numeric values
     - Missing values / zero-fill prototype preprocessing
     - Invalid file extensions
  6. CSV Export verification
"""

import os
import io
import json
import unittest
import numpy as np
import pandas as pd
import joblib

# Import from app.py
from app import (
    app,
    load_prediction_model,
    classify_risk,
    compute_warning_indicators,
    validate_and_preprocess_dataframe,
    REQUIRED_COLUMNS,
    MODEL_FEATURES,
    MODEL_PATH
)

class FakeGuardAITestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up Flask test client and ensure model is loaded."""
        app.config["TESTING"] = True
        cls.client = app.test_client()
        cls.model = load_prediction_model()

    # ==================== 1. MACHINE LEARNING & PIPELINE TESTS ====================
    def test_01_model_loaded_successfully(self):
        """Verify that the Random Forest model is saved and loads correctly."""
        self.assertIsNotNone(self.model)
        self.assertTrue(os.path.exists(MODEL_PATH))

    def test_02_model_accepts_exact_nine_features(self):
        """Verify that model expects exactly the 9 specified features and outputs probabilities."""
        sample_features = pd.DataFrame([{
            "account_age_days": 300,
            "followers_count": 1500,
            "following_count": 400,
            "posts_count": 50,
            "avg_likes": 80.0,
            "avg_comments": 8.0,
            "has_profile_pic": 1,
            "bio_length": 60,
            "repetitive_comments": 0
        }])[MODEL_FEATURES]

        probs = self.model.predict_proba(sample_features)
        self.assertEqual(probs.shape, (1, 2))
        prob_suspicious = probs[0][1]
        self.assertTrue(0.0 <= prob_suspicious <= 1.0)

    def test_03_exact_risk_classification_thresholds(self):
        """Verify strict adherence to specified risk thresholds."""
        # Below 40% -> Low Risk
        self.assertEqual(classify_risk(0.00), "Low Risk")
        self.assertEqual(classify_risk(0.25), "Low Risk")
        self.assertEqual(classify_risk(0.3999), "Low Risk")

        # 40% to below 70% -> Medium Risk
        self.assertEqual(classify_risk(0.40), "Medium Risk")
        self.assertEqual(classify_risk(0.55), "Medium Risk")
        self.assertEqual(classify_risk(0.6999), "Medium Risk")

        # 70% or above -> High Risk
        self.assertEqual(classify_risk(0.70), "High Risk")
        self.assertEqual(classify_risk(0.85), "High Risk")
        self.assertEqual(classify_risk(1.00), "High Risk")

    def test_04_independent_warning_signals(self):
        """Verify that rule-based warning indicators work independently from ML predictions."""
        # 1. New account age (< 30 days)
        w1 = compute_warning_indicators({"account_age_days": 15, "followers_count": 500, "following_count": 200, "avg_likes": 20, "has_profile_pic": 1, "repetitive_comments": 0})
        self.assertTrue(any("30 days" in s for s in w1))

        # 2. Extreme follow ratio (following > 2.5 * followers)
        w2 = compute_warning_indicators({"account_age_days": 200, "followers_count": 50, "following_count": 2000, "avg_likes": 5, "has_profile_pic": 1, "repetitive_comments": 0})
        self.assertTrue(any("following" in s.lower() for s in w2))

        # 3. Disproportionately low engagement (<0.5% like rate when followers > 100)
        w3 = compute_warning_indicators({"account_age_days": 200, "followers_count": 10000, "following_count": 200, "avg_likes": 2.0, "has_profile_pic": 1, "repetitive_comments": 0})
        self.assertTrue(any("engagement" in s.lower() for s in w3))

        # 4. Missing profile picture
        w4 = compute_warning_indicators({"account_age_days": 200, "followers_count": 500, "following_count": 200, "avg_likes": 20, "has_profile_pic": 0, "repetitive_comments": 0})
        self.assertTrue(any("Missing profile picture" in s for s in w4))

        # 5. Repetitive comments (>= 3)
        w5 = compute_warning_indicators({"account_age_days": 200, "followers_count": 500, "following_count": 200, "avg_likes": 20, "has_profile_pic": 1, "repetitive_comments": 4})
        self.assertTrue(any("repetitive comment" in s.lower() for s in w5))

    # ==================== 2. CSV VALIDATION & PREPROCESSING TESTS ====================
    def test_05_missing_columns_validation(self):
        """Verify rejection when required columns are absent."""
        df_incomplete = pd.DataFrame([{
            "username": "user1",
            "account_age_days": 50
            # Missing the other 8 columns
        }])
        with self.assertRaises(ValueError) as ctx:
            validate_and_preprocess_dataframe(df_incomplete)
        self.assertIn("Missing required column(s)", str(ctx.exception))

    def test_06_empty_dataframe_validation(self):
        """Verify rejection when CSV has headers but no data rows."""
        df_empty = pd.DataFrame(columns=REQUIRED_COLUMNS)
        with self.assertRaises(ValueError) as ctx:
            validate_and_preprocess_dataframe(df_empty)
        self.assertIn("no data rows", str(ctx.exception))

    def test_07_negative_values_validation(self):
        """Verify rejection when negative count values are present."""
        bad_df = pd.DataFrame([{
            "username": "bad_user",
            "account_age_days": -10,  # Negative!
            "followers_count": 100,
            "following_count": 50,
            "posts_count": 5,
            "avg_likes": 10,
            "avg_comments": 1,
            "has_profile_pic": 1,
            "bio_length": 20,
            "repetitive_comments": 0
        }])
        with self.assertRaises(ValueError) as ctx:
            validate_and_preprocess_dataframe(bad_df)
        self.assertIn("Non-negative validation failed", str(ctx.exception))

    def test_08_missing_numeric_values_zero_filled(self):
        """Verify that prototype preprocessing fills missing numeric values with zero."""
        df_with_nan = pd.DataFrame([{
            "username": "nan_user",
            "account_age_days": None,  # NaN
            "followers_count": 500,
            "following_count": None,   # NaN
            "posts_count": 10,
            "avg_likes": None,         # NaN
            "avg_comments": 2,
            "has_profile_pic": 1,
            "bio_length": 30,
            "repetitive_comments": 0
        }])
        clean_df = validate_and_preprocess_dataframe(df_with_nan)
        self.assertEqual(clean_df.loc[0, "account_age_days"], 0.0)
        self.assertEqual(clean_df.loc[0, "following_count"], 0.0)
        self.assertEqual(clean_df.loc[0, "avg_likes"], 0.0)

    # ==================== 3. FLASK API ENDPOINT TESTS ====================
    def test_09_get_home_page(self):
        """GET / returns HTML dashboard with HTTP 200."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"FakeGuard", response.data)
        self.assertIn(b"Random Forest", response.data)

    def test_10_get_sample_csv(self):
        """GET /api/sample returns downloadable CSV."""
        response = self.client.get("/api/sample")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "text/csv")
        # Check header contains required columns
        header_line = response.data.decode("utf-8").splitlines()[0]
        for col in REQUIRED_COLUMNS:
            self.assertIn(col, header_line)

    def test_11_post_analyze_valid_csv(self):
        """POST /api/analyze with valid CSV returns 200 and structured results."""
        csv_content = """username,account_age_days,followers_count,following_count,posts_count,avg_likes,avg_comments,has_profile_pic,bio_length,repetitive_comments
real_user,600,1200,450,80,95.5,10.2,1,75,0
bot_user,5,12,3500,0,0.0,0.0,0,0,5
"""
        data = {
            "file": (io.BytesIO(csv_content.encode("utf-8")), "test_accounts.csv")
        }
        response = self.client.post("/api/analyze", data=data, content_type="multipart/form-data")
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data["status"], "success")
        self.assertEqual(json_data["summary"]["total_accounts"], 2)
        self.assertEqual(len(json_data["results"]), 2)
        
        # Verify first account results structure
        u1 = json_data["results"][0]
        self.assertEqual(u1["username"], "real_user")
        self.assertIn("risk_score", u1)
        self.assertIn("risk_category", u1)
        self.assertIn("warning_indicators", u1)
        self.assertIn("features", u1)

    def test_12_post_analyze_invalid_extension(self):
        """POST /api/analyze with non-CSV returns 400 error."""
        data = {
            "file": (io.BytesIO(b"Hello world"), "document.txt")
        }
        response = self.client.post("/api/analyze", data=data, content_type="multipart/form-data")
        self.assertEqual(response.status_code, 400)
        json_data = response.get_json()
        self.assertIn("Only .csv files are supported", json_data["message"])

    def test_13_post_export_csv(self):
        """POST /api/export returns downloadable CSV with all columns + predictions."""
        sample_results = [
            {
                "username": "test_alex",
                "risk_score": 0.15,
                "risk_percentage": "15.0%",
                "risk_category": "Low Risk",
                "warning_indicators": [],
                "features": {
                    "account_age_days": 800,
                    "followers_count": 2500,
                    "following_count": 400,
                    "posts_count": 90,
                    "avg_likes": 120.0,
                    "avg_comments": 14.0,
                    "has_profile_pic": 1,
                    "bio_length": 85,
                    "repetitive_comments": 0
                }
            }
        ]
        response = self.client.post(
            "/api/export",
            data=json.dumps({"results": sample_results}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "text/csv")
        content = response.data.decode("utf-8")
        self.assertIn("username", content)
        self.assertIn("risk_score", content)
        self.assertIn("risk_category", content)
        self.assertIn("warning_signals", content)
        self.assertIn("test_alex", content)

    def test_14_get_health(self):
        """GET /api/health returns model status and risk threshold definitions."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data["status"], "healthy")
        self.assertTrue(json_data["model_loaded"])
        self.assertEqual(len(json_data["features"]), 9)

if __name__ == "__main__":
    unittest.main()
