# Client Management System (CMS) – Doctor Module

## Overview
This repository contains the full-stack web application for the Doctor Module of a CMS.
The backend follows Clean Architecture using C# ASP.NET Core 8 Web API.
The frontend is a modern, interactive React 19 application using Tailwind CSS.

## Features
- **Clean Architecture Backend**: Domain, Application, Infrastructure, API layers.
- **Modern UI**: React 19, Tailwind CSS, Vite.
- **Database**: PostgreSQL with Entity Framework Core migrations.
- **Integrations**: Stubs for WhatsApp Business API, QR Code Service, PDF Generation.
- **Roles**: Doctor & Receptionist Portal + Public Patient QR Check-in.

## Structure
- `backend/CMS` - ASP.NET Core 8 solution
  - `CMS.Domain` - Entities and Enums
  - `CMS.Application` - DTOs, Interfaces, MediatR logic
  - `CMS.Infrastructure` - EF Core DbContext, Service implementations (WhatsApp, QR)
  - `CMS.API` - Controllers, Program.cs, Appsettings
- `frontend/` - React 19 Vite application

## Setup Instructions

### Backend
1. Ensure PostgreSQL is installed and running.
2. Update the connection string in `backend/CMS.API/appsettings.json`.
3. Open a terminal in `backend/CMS.API` and run:
   ```bash
   dotnet ef database update --project ../CMS.Infrastructure/CMS.Infrastructure.csproj
   ```
4. Run the API:
   ```bash
   dotnet run
   ```

### Frontend
1. Open a terminal in the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Accessing the App
- **Doctor Portal**: `http://localhost:5173/login`
- **Patient QR Form**: `http://localhost:5173/patient-form/12345`

## Environment Variables
Ensure the following are set in `appsettings.json` for production:
- `WhatsApp:ApiToken`
- `WhatsApp:PhoneNumberId`
- `Jwt:Key`
