# Vehicle Maintenance Tracker — Project Reference

**Last Updated**: November 2024
**Version**: 2.0
**Live Demo**: https://vehicle-maintenance-tracker-ten.vercel.app/

---

## 1. Project Overview

**Vehicle Maintenance Tracker** is a full-stack TypeScript + React application for managing vehicle fleets and maintenance schedules. Built with Supabase for backend and authentication.

### Key Features
- ✅ Multi-user support with email/password authentication
- ✅ Vehicle inventory management (CRUD)
- ✅ VIN decoder for auto-populating vehicle details
- ✅ Image upload with camera capture support
- ✅ Maintenance history tracking with costs and parts
- ✅ Maintenance protocols & smart reminders
- ✅ Community-driven parts database
- ✅ Dashboard with overdue/upcoming maintenance alerts
- ✅ Row Level Security (RLS) for data privacy

---

## 2. Technology Stack

| Layer            | Technology                           |
|------------------|--------------------------------------|
| Frontend         | React 18, TypeScript, Vite          |
| Styling          | TailwindCSS 3.x                     |
| Backend / DB     | Supabase (PostgreSQL)               |
| Storage          | Supabase Storage (vehicle images)   |
| Authentication   | Supabase Auth (email/password)      |
| State Management | React `useState` / props            |
| API Integration  | NHTSA VIN Decoder API (free)        |
| Routing          | react-router-dom v7                 |
| Linting          | ESLint 8                            |
| Build Tool       | Vite 4                              |
| Deployment       | Vercel                              |

---

## 3. Project Structure

```
vehicle-maintenance-tracker/
├── src/
│   ├── components/
│   │   ├── AuthForm.tsx              # Email/password auth with forgot password
│   │   ├── ProtectedPage.tsx         # Route protection HOC
│   │   ├── VehicleForm.tsx           # Add vehicle with VIN decoder
│   │   ├── VehicleList.tsx           # List vehicles with edit/delete
│   │   ├── ImageUpload.tsx           # Camera capture + file upload
│   │   ├── MaintenanceForm.tsx       # Add maintenance with parts
│   │   ├── MaintenanceList.tsx       # View maintenance history
│   │   ├── ProtocolAssignment.tsx    # Assign protocols to vehicles
│   │   ├── PartsSelector.tsx         # Community parts database UI
│   │   ├── Toast.tsx                 # Notification toasts
│   │   └── ConfirmModal.tsx          # Confirmation dialogs
│   ├── pages/
│   │   ├── Dashboard.tsx             # Overview with alerts
│   │   ├── Inventory.tsx             # Manage vehicles
│   │   ├── VehicleDetails.tsx        # Vehicle page with protocols & history
│   │   └── Protocols.tsx             # Manage maintenance protocols
│   ├── services/
│   │   ├── VehicleService.ts         # Vehicle CRUD operations
│   │   ├── MaintenanceService.ts     # Maintenance CRUD operations
│   │   ├── ProtocolService.ts        # Protocol & reminder logic
│   │   ├── PartsService.ts           # Community parts database
│   │   └── VinDecoderService.ts      # NHTSA VIN decoder
│   ├── types/
│   │   ├── Vehicle.ts                # Vehicle interface
│   │   ├── Maintenance.ts            # Maintenance record interface
│   │   ├── Protocol.ts               # Protocol & reminder interfaces
│   │   └── Parts.ts                  # Parts database interfaces
│   ├── lib/
│   │   └── supabaseClient.ts         # Supabase initialization
│   ├── App.tsx                       # Main app with routing
│   ├── index.tsx                     # React entry point
│   └── index.css                     # Tailwind imports
├── public/
│   └── favicon.ico
├── *.sql                             # Database setup scripts
├── *_SETUP.md                        # Setup documentation
├── .env.example                      # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.cjs
├── vite.config.ts
└── vercel.json                       # SPA routing config
```

---

## 4. Database Schema

### Table: `vehicles`

| Column        | Type      | Notes                              |
|--------------|-----------|-------------------------------------|
| id           | UUID      | Primary Key                         |
| user_id      | UUID      | References `auth.users`             |
| make         | TEXT      | Manufacturer (e.g., "Honda")        |
| model        | TEXT      | Model name (e.g., "Accord")         |
| year         | INTEGER   | Model year                          |
| vin          | TEXT      | Optional VIN (17 characters)        |
| license_plate| TEXT      | Optional license plate              |
| color        | TEXT      | Optional vehicle color              |
| mileage      | INTEGER   | Optional current mileage            |
| engine       | TEXT      | Optional engine info                |
| image_url    | TEXT      | URL to Supabase Storage image       |
| notes        | TEXT      | Optional user notes                 |
| created_at   | TIMESTAMP | Auto-generated                      |

**RLS Policies**: Users can only access their own vehicles

---

### Table: `maintenance_records`

| Column       | Type      | Notes                              |
|-------------|-----------|-------------------------------------|
| id          | UUID      | Primary Key                         |
| vehicle_id  | UUID      | References `vehicles(id)`           |
| user_id     | UUID      | References `auth.users`             |
| service_type| TEXT      | E.g., "Oil Change", "Tire Rotation" |
| description | TEXT      | Optional description                |
| service_date| DATE      | Date of service                     |
| mileage     | INTEGER   | Optional mileage at service         |
| cost        | NUMERIC   | Optional cost                       |
| notes       | TEXT      | Optional notes                      |
| parts_used  | JSONB     | Array of parts: `[{type, number, brand, notes}]` |
| created_at  | TIMESTAMP | Auto-generated                      |
| updated_at  | TIMESTAMP | Auto-updated                        |

**RLS Policies**: Users can only access their own records

---

### Table: `maintenance_protocols`

| Column       | Type      | Notes                              |
|-------------|-----------|-------------------------------------|
| id          | UUID      | Primary Key                         |
| user_id     | UUID      | NULL for defaults, user ID for custom |
| name        | TEXT      | E.g., "Oil Change - 3k/3mo"         |
| service_type| TEXT      | Matches maintenance service types   |
| interval_months | INTEGER | Time-based interval (nullable)    |
| interval_miles  | INTEGER | Mileage-based interval (nullable) |
| description | TEXT      | Optional description                |
| is_default  | BOOLEAN   | True for system defaults            |
| created_at  | TIMESTAMP | Auto-generated                      |
| updated_at  | TIMESTAMP | Auto-updated                        |

**Default Protocols**:
- Oil Change - 3k/3mo
- Oil Change - 5k/5mo
- Tire Rotation - 6k/6mo
- Air Filter - 12k/12mo
- Brake Inspection - 12k/12mo

**RLS Policies**: Users can view defaults + own protocols, edit/delete own only

---

### Table: `vehicle_protocols`

| Column              | Type      | Notes                              |
|--------------------|-----------|-------------------------------------|
| id                 | UUID      | Primary Key                         |
| vehicle_id         | UUID      | References `vehicles(id)`           |
| protocol_id        | UUID      | References `maintenance_protocols(id)` |
| user_id            | UUID      | References `auth.users`             |
| last_service_date  | DATE      | When last performed (nullable)      |
| last_service_mileage| INTEGER  | Mileage when last performed (nullable) |
| created_at         | TIMESTAMP | Auto-generated                      |

**Purpose**: Links protocols to vehicles and tracks when last performed for reminder calculations

**RLS Policies**: Users can only access their own assignments

---

### Table: `vehicle_parts`

| Column       | Type      | Notes                              |
|-------------|-----------|-------------------------------------|
| id          | UUID      | Primary Key                         |
| make        | TEXT      | Vehicle make (e.g., "Honda")        |
| model       | TEXT      | Vehicle model (e.g., "Accord")      |
| year_start  | INTEGER   | Start of compatible year range      |
| year_end    | INTEGER   | End of compatible year range        |
| service_type| TEXT      | E.g., "Oil Change"                  |
| part_type   | TEXT      | E.g., "Oil Filter", "Motor Oil"     |
| part_number | TEXT      | Part number                         |
| brand       | TEXT      | Brand name (nullable)               |
| notes       | TEXT      | Optional notes                      |
| user_id     | UUID      | References `auth.users` (who added) |
| times_used  | INTEGER   | Popularity counter (default: 1)     |
| verified    | BOOLEAN   | Auto-true after 10 uses             |
| flagged_count| INTEGER  | Number of flags (default: 0)        |
| created_at  | TIMESTAMP | Auto-generated                      |
| updated_at  | TIMESTAMP | Auto-updated                        |

**Purpose**: Community-driven parts database with auto-verification

**RLS Policies**: All users can view, users can add/edit/delete their own parts

---

### Storage Bucket: `vehicle_images`

- **Public**: Yes
- **File size limit**: 5MB
- **Allowed file types**: image/*
- **RLS Policies**: Authenticated users can upload, anyone can view

---

## 5. Environment Variables

### `.env` (Local Development)
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel Environment Variables
Same as above, set in Vercel Dashboard → Settings → Environment Variables

**Note**: `VITE_` prefix is required for Vite to expose variables to client-side code

---

## 6. Key Features Implementation

### 6.1 Authentication System
**File**: `src/components/AuthForm.tsx`

- Email/password signup with validation
- Email verification flow
- Login with password
- Forgot password functionality
- Protected routes via `ProtectedPage.tsx`

**Documentation**: `AUTH_SETUP.md`

---

### 6.2 Vehicle Management
**Files**: `VehicleForm.tsx`, `VehicleList.tsx`, `VehicleDetails.tsx`

- Add/edit/delete vehicles
- VIN decoder auto-populates: make, model, year, engine
- Image upload with camera capture (mobile) or file upload
- Display vehicle details with protocols and maintenance history

**VIN Decoder**: Uses free NHTSA API (no API key required)
**Documentation**: `RLS_SETUP.md`, `STORAGE_SETUP.md`

---

### 6.3 Maintenance Tracking
**Files**: `MaintenanceForm.tsx`, `MaintenanceList.tsx`

- Record service history with date, mileage, cost
- Select service type from predefined list
- Track parts used with community database
- View maintenance history with summary stats
- Edit/delete maintenance records

**Service Types**: Oil Change, Tire Rotation, Brake Service, Air Filter, Battery, Coolant Flush, Transmission, Inspection, Repair, Other

**Documentation**: `MAINTENANCE_SETUP.md`

---

### 6.4 Maintenance Protocols & Reminders
**Files**: `Protocols.tsx`, `ProtocolAssignment.tsx`, `ProtocolService.ts`

**Features**:
- Create custom maintenance protocols
- Use default protocols (5 pre-configured)
- Assign protocols to vehicles
- Track last service date/mileage
- Calculate upcoming/overdue maintenance
- Dashboard alerts for overdue items
- Time-based (months) and/or mileage-based intervals

**Reminder Logic**:
```
Due if:
- (Current Date > Last Service Date + Interval Months) OR
- (Current Mileage > Last Service Mileage + Interval Miles)
```

**Documentation**: `PROTOCOLS_SETUP.md`

---

### 6.5 Community Parts Database
**Files**: `PartsSelector.tsx`, `PartsService.ts`

**Features**:
- Crowd-sourced parts database
- Smart suggestions based on make/model/year/service type
- Toggle between "Community" and "My Parts Only"
- Add custom parts with notes
- Parts auto-verify after 10 uses
- Verification badges: ✅ Verified, 🆕 New, 👤 Your Part
- Usage statistics (times used)
- Flag system for incorrect parts

**Workflow**:
1. User adds maintenance for vehicle
2. System suggests parts from database
3. User selects parts or adds custom
4. Custom parts get added to community database
5. Popular parts rise to top of suggestions

**Documentation**: `PARTS_DATABASE_SETUP.md`

---

## 7. Component Architecture

### Service Layer Pattern
All database operations go through service classes:
- `VehicleService` - Vehicle CRUD
- `MaintenanceService` - Maintenance CRUD
- `ProtocolService` - Protocols, assignments, reminder calculations
- `PartsService` - Parts database, suggestions, statistics
- `VinDecoderService` - VIN decoding via NHTSA API

### Component Composition
- Pages use components
- Components use services
- Services use Supabase client
- All components are TypeScript with strict typing

### State Management
- Local state with `useState`
- Props for parent-child communication
- Refresh patterns with `refreshKey`
- Toast notifications for user feedback
- Modals for confirmations

---

## 8. Security Features

### Row Level Security (RLS)
All tables have RLS policies ensuring users can only access their own data

### Authentication
- Email verification required for signup
- Password reset via email
- Protected routes check authentication
- Automatic user_id injection in services

### Storage Security
- Authenticated uploads only
- Public read access for vehicle images
- File paths include user ID for isolation

---

## 9. API Integrations

### NHTSA VIN Decoder API
- **Endpoint**: `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{VIN}?format=json`
- **Cost**: Free, no API key required
- **Rate Limit**: None specified
- **Returns**: Make, model, year, engine, transmission, body class, etc.

---

## 10. Deployment

### Platform: Vercel
- **URL**: https://vehicle-maintenance-tracker-ten.vercel.app/
- **Auto-deploy**: On push to `main` branch
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Set in Vercel dashboard

### Vercel Configuration
**File**: `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
*Required for React Router SPA routing*

---

## 11. Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

### Local Development
```bash
# Clone repository
git clone https://github.com/emorain/vehicle-maintenance-tracker.git
cd vehicle-maintenance-tracker

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
# Opens at http://localhost:5173
```

### Database Setup
Run SQL scripts in Supabase SQL Editor in this order:
1. `RLS_SETUP.md` - Create vehicles table and policies
2. `STORAGE_SETUP.md` - Create storage bucket and policies
3. `MAINTENANCE_SETUP.md` - Create maintenance_records table
4. `PROTOCOLS_SETUP.sql` - Create protocols tables and defaults
5. `PARTS_DATABASE_SETUP.sql` - Create parts database
6. `ADD_ENGINE_COLUMN.sql` - Add engine column to vehicles

### Supabase Auth Configuration
1. Go to Authentication → URL Configuration
2. Set **Site URL**: `http://localhost:5173` (local) or `https://your-vercel-url.vercel.app` (production)
3. Add **Redirect URLs**: `http://localhost:5173/**` and `https://your-vercel-url.vercel.app/**`

### Deployment to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Redeploy for env vars to take effect
vercel --prod
```

---

## 12. Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env` and Vercel

### Issue: "new row violates row-level security policy"
**Solution**: Run RLS setup SQL scripts, ensure policies are created

### Issue: "Bucket not found" for images
**Solution**: Create `vehicle_images` bucket in Supabase Storage, set to Public, run storage policies

### Issue: Authentication redirects fail
**Solution**: Add your domain to Supabase Auth → URL Configuration

### Issue: VIN decoder doesn't populate all fields
**Solution**: Some VINs may not have all data in NHTSA database, this is normal

### Issue: Parts suggestions not showing
**Solution**: Ensure `PARTS_DATABASE_SETUP.sql` was run and sample parts were inserted

---

## 13. Future Enhancements

### Planned Features
- [ ] Mobile app (React Native)
- [ ] Export maintenance history to PDF
- [ ] Fuel tracking
- [ ] Expense reports and analytics
- [ ] Multiple vehicle photos
- [ ] Service reminders via email/SMS
- [ ] Integration with auto parts retailers (API pricing)
- [ ] Admin dashboard for parts verification
- [ ] Public vehicle history (optional for resale)

### Potential Integrations
- AutoZone/O'Reilly API for parts pricing
- Twilio for SMS reminders
- SendGrid for email notifications
- Stripe for premium features

---

## 14. Contributing

### Code Style
- TypeScript strict mode
- ESLint configuration
- Tailwind CSS for styling
- Functional components with hooks
- Service layer for all data operations

### Git Workflow
- `main` branch protected
- Feature branches for new work
- Commits with descriptive messages
- Pull requests for review

---

## 15. License & Credits

**License**: MIT

**Built With**:
- React + TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- TailwindCSS
- NHTSA VIN Decoder API
- Vercel Hosting

**Generated With**: [Claude Code](https://claude.com/claude-code)

---

**Last Updated**: November 2024
**Maintainer**: [emorain](https://github.com/emorain)
