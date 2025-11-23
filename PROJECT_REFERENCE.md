# Vehicle Maintenance Tracker - Project Reference

## Project Overview
A comprehensive vehicle maintenance tracking application built with React, TypeScript, and Supabase.

**Repository**: https://github.com/emorain/vehicle-maintenance-tracker
**Latest Commit**: 5437270 - Add PDF export and multiple images support

## Tech Stack
- Frontend: React 18 + TypeScript + Vite
- Backend: Supabase (PostgreSQL + Authentication + Storage)
- Styling: Tailwind CSS
- PDF Generation: jspdf + jspdf-autotable
- VIN Decoding: NHTSA API

## Core Features

### PDF Export (NEW - Commit 5437270)
- Export complete maintenance history to PDF
- Includes vehicle info, maintenance records, and fuel statistics
- Professional formatting with headers and page numbers

### Multiple Images Support (NEW - Commit 5437270)
- Upload up to 10 photos per vehicle
- Grid gallery display
- Mobile camera capture
- Individual image deletion
- Images stored in Supabase Storage

### Other Features
- Vehicle management with VIN decoder
- Maintenance tracking with parts database
- Custom maintenance protocols
- Fuel tracking with MPG calculations
- Community parts database with voting

## Recent Changes (Commit 5437270)

### Files Created
- src/services/ExportService.ts
- ADD_MULTIPLE_IMAGES.sql

### Files Modified
- src/types/Vehicle.ts - Added images array
- src/components/ImageUpload.tsx - Complete rewrite for multiple files
- src/components/VehicleForm.tsx - Updated for images array
- src/components/VehicleList.tsx - Updated view/edit modes
- src/pages/VehicleDetails.tsx - Added gallery and export button
- package.json - Added jspdf dependencies

### Database Migration Required
Run ADD_MULTIPLE_IMAGES.sql in Supabase to add images column

## Free Tier Features
- Unlimited vehicles and records
- Cloud sync
- VIN decoder
- PDF export
- Multiple photos (up to 10 per vehicle)
- Fuel tracking
- Community parts database
- No ads
