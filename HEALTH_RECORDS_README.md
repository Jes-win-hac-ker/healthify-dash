# Health Records & Tracking System

## Overview
A comprehensive health management system that allows users to track their health metrics, manage medications, store medical records, and log symptoms.

## Features Implemented

### 1. **Health Records Dashboard** (`/health`)
- Central hub for all health tracking features
- Four main sections:
  - Health Metrics
  - Medications
  - Medical Records
  - Symptoms Journal

### 2. **Health Metrics Tracking** (`/health/metrics`)
Track vital signs and measurements:
- **Blood Pressure** (systolic/diastolic)
- **Heart Rate** (bpm)
- **Blood Glucose** (mg/dL)
- **Weight** (kg)
- **Body Temperature** (°F)
- **Oxygen Saturation** (%)

Features:
- Add new metrics with optional notes
- View historical data with timestamps
- Color-coded metric cards

### 3. **Medications Manager** (`/health/medications`)
Manage your medications:
- Add medications with:
  - Name and dosage
  - Frequency (once daily, twice daily, as needed, etc.)
  - Start and end dates
  - Prescribing doctor
  - Notes
- Quick "Log Dose" button for active medications
- Active/Inactive status badges
- Track medication logs in `medication_logs` table

### 4. **Medical Records** (`/health/records`)
Store important medical documents:
- **Record Types:**
  - Prescriptions
  - Lab Results
  - Imaging (X-rays, MRIs)
  - Medical Reports
  - Other
- Color-coded badges by type
- Record date tracking
- Description field for additional context

### 5. **Symptoms Journal** (`/health/symptoms`)
Track symptoms and identify patterns:
- Log symptom name
- Severity scale (1-10) with visual slider
- Color-coded severity:
  - Green (1-3): Mild
  - Yellow (4-6): Moderate
  - Red (7-10): Severe
- Optional description and triggers
- Timestamp for each entry

## Database Schema

### Tables Created

#### `health_metrics`
- `id` (UUID)
- `user_id` (UUID, FK to auth.users)
- `metric_type` (TEXT: blood_pressure, heart_rate, glucose, weight, temperature, oxygen_saturation)
- `value` (JSONB: flexible storage for different metric formats)
- `unit` (TEXT)
- `notes` (TEXT, optional)
- `recorded_at` (TIMESTAMP)

#### `medications`
- `id` (UUID)
- `user_id` (UUID, FK to auth.users)
- `medication_name` (TEXT)
- `dosage` (TEXT)
- `frequency` (TEXT)
- `start_date` (DATE)
- `end_date` (DATE, optional)
- `prescribing_doctor` (TEXT, optional)
- `notes` (TEXT, optional)
- `active` (BOOLEAN)

#### `medication_logs`
- `id` (UUID)
- `medication_id` (UUID, FK to medications)
- `user_id` (UUID, FK to auth.users)
- `taken_at` (TIMESTAMP)
- `status` (TEXT: taken, missed, skipped)
- `notes` (TEXT, optional)

#### `medical_records`
- `id` (UUID)
- `user_id` (UUID, FK to auth.users)
- `title` (TEXT)
- `record_type` (TEXT: prescription, lab_result, imaging, medical_report, other)
- `description` (TEXT, optional)
- `file_url` (TEXT, optional - for future file uploads)
- `file_name` (TEXT, optional)
- `file_size` (INTEGER, optional)
- `record_date` (DATE, optional)

#### `symptoms_journal`
- `id` (UUID)
- `user_id` (UUID, FK to auth.users)
- `symptom_name` (TEXT)
- `severity` (INTEGER, 1-10)
- `description` (TEXT, optional)
- `triggers` (TEXT, optional)
- `recorded_at` (TIMESTAMP)

## Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Policies for SELECT, INSERT, UPDATE, DELETE operations

## Routing Structure
```
/health                      → Health Records Dashboard
/health/metrics              → Health Metrics Tracking
/health/medications          → Medications Manager
/health/records              → Medical Records
/health/symptoms             → Symptoms Journal
```

## UI/UX Features
- Responsive design
- Loading states
- Empty states with helpful prompts
- Modal dialogs for adding new entries
- Toast notifications for success/error feedback
- Color-coded visual indicators
- Back navigation buttons
- Authentication checks

## Migration Files
1. `20251110000001_health_records_tracking.sql` - Creates all tables, RLS policies, and indexes

## Next Steps (Future Enhancements)
- File upload functionality for medical records
- Charts and graphs for health metrics trends
- Medication reminders/notifications
- Export data to PDF
- Share health summary with doctors
- Integration with wearables (Fitbit, Apple Health)
