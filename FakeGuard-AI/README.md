# FakeGuard AI — Fake Follower Detection System

[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/framework-Flask-lightgrey.svg)](https://flask.palletsprojects.com/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn-orange.svg)](https://scikit-learn.org/)
[![Model](https://img.shields.io/badge/Algorithm-Random%20Forest-green.svg)](https://scikit-learn.org/stable/modules/ensemble.html#forests-of-randomized-trees)
[![License](https://img.shields.io/badge/license-Academic%20Prototype-purple.svg)](#disclaimer)

**FakeGuard AI** is a professional, web-based software dashboard and machine learning platform engineered to detect suspicious and automated Instagram follower accounts. Designed as an academic engineering prototype, FakeGuard AI combines a serialized **Scikit-learn Random Forest Pipeline** with an **independent heuristic explanation module** to audit account health, score suspicious probability, and export formal compliance reports.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Capabilities & UI Features](#key-capabilities--ui-features)
3. [Technology Stack](#technology-stack)
4. [Project Folder Structure](#project-folder-structure)
5. [Machine Learning Detection Engine](#machine-learning-detection-engine)
   - [Model Architecture & Serialization](#model-architecture--serialization)
   - [The Nine Input Features](#the-nine-input-features)
   - [Methodological Note on Missing Values](#methodological-note-on-missing-values)
   - [Exact Risk Classification Thresholds](#exact-risk-classification-thresholds)
   - [Independent Rule-Based Warning Signals](#independent-rule-based-warning-signals)
6. [Installation & Local Execution](#installation--local-execution)
7. [REST API Documentation](#rest-api-documentation)
8. [Automated Testing & Quality Assurance](#automated-testing--quality-assurance)
9. [Security, Privacy & Ethics](#security-privacy--ethics)
10. [Academic Prototype Disclaimer & Known Limitations](#academic-prototype-disclaimer--known-limitations)

---

## 1. Project Overview

Social media platforms face persistent challenges with automated bots, mass-following scripts, engagement pods, and commercial fake follower networks. These profiles distort analytics, degrade genuine audience engagement, and facilitate phishing and spam campaigns.

**FakeGuard AI** provides an end-to-end detection system:
- Ingests structured account metrics via secure CSV uploads or real-time simulation.
- Validates data types, counts, and schemas strictly against an established 10-column standard.
- Predicts suspicious probability using an ensemble Random Forest pipeline.
- Flags transparent, deterministic heuristic warning signals independently of the black-box classifier.
- Visualizes cohort statistics and generates downloadable CSV audit reports.

---

## 2. Key Capabilities & UI Features

- **Modern Dark-Themed AI Dashboard:** High-contrast palette (`#090d16` background, purple/blue gradient accents, glassmorphism cards).
- **Nine Responsive Sections:**
  1. *Dashboard / Overview:* Key metrics (Total, Low, Medium, High Risk counts), interactive Chart.js doughnut & bar graphs, recent analysis preview.
  2. *Analyze Accounts:* Real-time single-account simulator with instant risk gauge meter and preset test profiles.
  3. *Upload CSV Dataset:* Drag-and-drop ingestion zone with schema validation and one-click sample loader.
  4. *Account Analysis Results:* Full data table with live username search, risk tier filtering, multi-column sorting, pagination, and detailed account drawers.
  5. *Risk Distribution:* Cohort probability segmentation, follower vs. following asymmetry scatter charts, and sensitivity metrics.
  6. *Analysis History:* Audit trail preserving previous batch runs within the browser session for comparison.
  7. *Reports and Export:* Formal executive summaries with downloadable CSV reports.
  8. *Methodology:* Transparent documentation of feature definitions, pipeline flow, and heuristic rules.
  9. *Settings:* Display density toggles, animation controls, and backend health monitoring.
- **Pure Vanilla Frontend:** Strictly HTML5, CSS3, and Vanilla JavaScript—no heavy front-end frameworks (React/Vue/Angular) used.

---

## 3. Technology Stack

- **Backend:** Python 3.10+ & Flask 3.1+
- **Data Manipulation:** Pandas 2.0+ & NumPy 1.24+
- **Machine Learning:** Scikit-learn 1.3+ (`RandomForestClassifier`, `SimpleImputer`, `Pipeline`)
- **Model Serialization:** Joblib 1.3+
- **Frontend:** HTML5, Modern CSS3 (Grid & Flexbox), Vanilla JavaScript (ES6+)
- **Visualization:** Chart.js 4.4+ (Doughnut, Bar, Scatter charts)

---

## 4. Project Folder Structure

```text
FakeGuard-AI/
│
├── app.py                      # Flask application and REST API endpoints
├── train_model.py              # ML pipeline training script & synthetic dataset generator
├── test_app.py                 # Automated unit and integration test suite
├── requirements.txt            # Python dependencies
├── README.md                   # Complete project documentation
│
├── models/
│   └── random_forest_model.pkl # Serialized Scikit-learn Random Forest pipeline
│
├── data/
│   └── sample_followers.csv    # 20-record demonstration CSV dataset
│
├── templates/
│   └── index.html              # Core single-page application dashboard
│
└── static/
    ├── css/
    │   └── style.css           # Premium dark-theme styling, animations, responsive rules
    └── js/
        └── script.js           # Client-side routing, API requests, charts, search & filter
```

---

## 5. Machine Learning Detection Engine

### Model Architecture & Serialization

The core detection engine uses an encapsulated **Scikit-learn Pipeline** saved via **Joblib** to `models/random_forest_model.pkl`:

```python
Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('classifier', RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    ))
])
```

### The Nine Input Features

The `username` attribute is strictly treated as an identifier and is **never** used as a numeric feature. Exactly 9 numeric features are analyzed:

| # | Feature Column | Type | Description |
|---|---|---|---|
| 1 | `account_age_days` | Float / Int | Lifespan of the account in days. |
| 2 | `followers_count` | Float / Int | Total accounts following this profile. |
| 3 | `following_count` | Float / Int | Total accounts followed by this profile. |
| 4 | `posts_count` | Float / Int | Total published media posts. |
| 5 | `avg_likes` | Float | Average likes received per post. |
| 6 | `avg_comments` | Float | Average comments received per post. |
| 7 | `has_profile_pic` | Binary (0/1) | 1 if custom photo uploaded; 0 if default avatar. |
| 8 | `bio_length` | Float / Int | Character count of the biography description. |
| 9 | `repetitive_comments` | Float / Int | Frequency of duplicate or spam comments posted. |

### Methodological Note on Missing Values

Per the project report specifications:
1. **Prototype Ingestion Layer:** The preprocessing step explicitly fills missing numeric values with zero prior to inference (`df[feat].fillna(0.0)`).
2. **Pipeline Safeguard Layer:** The serialized Scikit-learn Pipeline internally encapsulates a `SimpleImputer(strategy='median')`. 

This dual-layer design guarantees that even if raw API payloads bypass prototype pre-cleaning, the model gracefully imputes values rather than failing at runtime.

### Exact Risk Classification Thresholds

Predictions from `model.predict_proba(X)[:, 1]` are mapped to exact risk tiers:

| Suspicious Probability Range | Risk Classification | Interpretation |
|---|---|---|
| **Below 40%** (`< 0.40`) | **Low Risk** | Natural organic user behavior and balanced metrics. |
| **40% to below 70%** (`[0.40, 0.70)`) | **Medium Risk** | Borderline account; irregular engagement or follow spike. |
| **70% or above** (`≥ 0.70`) | **High Risk** | Elevated probability of bot farm, automated script, or ghost account. |

### Independent Rule-Based Warning Signals

In parallel with the ML engine, an **independent explanation module** evaluates deterministic heuristic checks:

1. **New Account Age:** `account_age_days < 30` &rarr; *"Account created recently (< 30 days old)"*
2. **Extreme Follow Asymmetry:** `following_count > 1500 and followers_count < 100` or `following_to_follower_ratio > 2.5` &rarr; *"Unusually high following count relative to followers"*
3. **Disproportionately Low Engagement:** `followers_count > 100 and (avg_likes / followers) < 0.005` &rarr; *"Disproportionately low engagement (<0.5% like rate)"*
4. **Missing Profile Picture:** `has_profile_pic == 0` &rarr; *"Missing profile picture (default avatar)"*
5. **Repetitive Comment Spam:** `repetitive_comments >= 3` &rarr; *"Elevated repetitive comment spam detected (≥3 flags)"*

> **Critical Note on Separation:** These warning signals are evaluated independently from the Random Forest model and are **not** causal explanations of the model's internal feature weights or tree splits.

---

## 6. Installation & Local Execution

### Prerequisites
- Python 3.10 or higher
- PowerShell, Bash, or Windows Terminal

### Step 1: Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Train and Serialize the ML Model
```bash
python train_model.py
```
*This step generates the synthetic demonstration dataset, trains the Random Forest pipeline, saves `models/random_forest_model.pkl`, and writes `data/sample_followers.csv`.*

### Step 4: Launch the Web Application
```bash
python app.py
```

### Step 5: Open in Web Browser
Open:
```text
http://127.0.0.1:5000
```

---

## 7. REST API Documentation

### 1. `GET /`
- **Description:** Renders the main FakeGuard AI dashboard.
- **Response:** `200 OK` (HTML)

### 2. `GET /api/sample`
- **Description:** Downloads the standard 20-record demonstration CSV.
- **Response:** `200 OK` (MIME: `text/csv`, attachment filename: `sample_followers.csv`)

### 3. `POST /api/analyze`
- **Description:** Ingests a CSV file or JSON array, executes validation, generates predictions, and flags heuristic warnings.
- **Headers:** `Content-Type: multipart/form-data` or `Content-Type: application/json`
- **Payload Example (JSON):**
  ```json
  [
    {
      "username": "alex_tech",
      "account_age_days": 890,
      "followers_count": 1540,
      "following_count": 430,
      "posts_count": 78,
      "avg_likes": 88.0,
      "avg_comments": 12.5,
      "has_profile_pic": 1,
      "bio_length": 112,
      "repetitive_comments": 0
    }
  ]
  ```
- **Response Format:**
  ```json
  {
    "status": "success",
    "message": "Successfully analyzed 1 account(s).",
    "summary": {
      "total_accounts": 1,
      "low_risk": 1,
      "medium_risk": 0,
      "high_risk": 0,
      "average_risk_score": 0.052,
      "average_risk_percentage": "5.2%"
    },
    "results": [
      {
        "username": "alex_tech",
        "risk_score": 0.052,
        "risk_percentage": "5.2%",
        "risk_category": "Low Risk",
        "warning_indicators": [],
        "features": {
          "account_age_days": 890,
          "followers_count": 1540,
          "following_count": 430,
          "posts_count": 78,
          "avg_likes": 88.0,
          "avg_comments": 12.5,
          "has_profile_pic": 1,
          "bio_length": 112,
          "repetitive_comments": 0
        }
      }
    ]
  }
  ```

### 4. `POST /api/export`
- **Description:** Generates a downloadable CSV report containing original features, risk scores, categories, and warning signals.
- **Headers:** `Content-Type: application/json`
- **Response:** `200 OK` (MIME: `text/csv`, attachment filename: `fakeguard_ai_analysis_report.csv`)

### 5. `GET /api/health`
- **Description:** System health check, model persistence status, and active threshold configuration.
- **Response:** `200 OK` (JSON)

---

## 8. Automated Testing & Quality Assurance

FakeGuard AI includes a 14-point automated test suite covering all functional, machine learning, and validation requirements.

To run the full test suite:
```bash
python test_app.py
```

### Test Verification Coverage:
| Test ID | Verification Scope | Status |
|---|---|---|
| `test_01` | Saved Random Forest model loads correctly from `models/` | PASSED |
| `test_02` | Model pipeline strictly requires 9 numeric features | PASSED |
| `test_03` | Exact risk thresholds (<40%, 40-70%, ≥70%) adherence | PASSED |
| `test_04` | Independent evaluation of all 5 heuristic rule warnings | PASSED |
| `test_05` | Rejection of CSVs with missing required columns | PASSED |
| `test_06` | Detection and rejection of empty CSV files | PASSED |
| `test_07` | Non-negative constraint enforcement on count features | PASSED |
| `test_08` | Prototype zero-filling of missing numeric entries | PASSED |
| `test_09` | GET `/` dashboard serving with 200 OK | PASSED |
| `test_10` | GET `/api/sample` CSV download and header validation | PASSED |
| `test_11` | POST `/api/analyze` multipart CSV end-to-end ingestion | PASSED |
| `test_12` | Rejection of invalid file extensions (non-.csv) | PASSED |
| `test_13` | POST `/api/export` downloadable CSV generation | PASSED |
| `test_14` | GET `/api/health` monitoring status | PASSED |

---

## 9. Security, Privacy & Ethics

1. **No Scraping or Instagram Credential Harvester:** The application **never** requires Instagram login credentials, API session keys, or user passwords. It performs no web scraping or unauthorized bypass of Instagram's anti-bot protections.
2. **Ephemeral Memory Processing:** Uploaded CSV files are processed in-memory (`io.StringIO`) and are never written to disk or persistently stored in unmanaged databases.
3. **Strict Upload Boundaries:** Uploads are limited to 5 MB (`MAX_CONTENT_LENGTH = 5 * 1024 * 1024`), file extensions are strictly validated to `.csv`, and filenames are sanitized using `werkzeug.utils.secure_filename`.
4. **Identifier Isolation:** Usernames are strictly excluded from numeric machine learning calculations to avoid lexical bias.

---

## 10. Academic Prototype Disclaimer & Known Limitations

- **Synthetic Demonstration Dataset:** The Random Forest model in this repository is trained on a synthetic demonstration dataset designed to reflect known patterns of bot activity (mass-following, ghost followers, spam comment repetitions) alongside authentic organic behavior.
- **No Real-World Generalization Claims:** Performance metrics (precision, recall, ROC-AUC) obtained on this synthetic holdout are demonstration indicators only. They do not prove real-world accuracy on live Instagram accounts.
- **Production Prerequisites:** To use this system in production, researchers and developers must collect, ethically anonymize, and human-audit a representative dataset of actual Instagram profiles subject to Instagram Terms of Service and applicable privacy regulations (such as GDPR and CCPA).

---

## Authors & Demonstration Details
- **Project:** FakeGuard AI — Fake Follower Detection System
- **Engineering Track:** Machine Learning & Web Architecture
- **Demonstration:** Academic Final-Year Engineering Demonstration Ready
