# Attendance Tracker App

A comprehensive mobile attendance tracking application built with React Native and Expo, featuring a JSON Server backend for realistic data simulation.

## Features

### 🔐 Authentication
- **Quick PIN Login**: Fast 4-digit PIN authentication
- **Traditional Login**: Username/password authentication
- **Company Code Support**: Multi-company support with DPWORLD as default
- **Secure Storage**: Token-based authentication with secure storage

### ⏰ Attendance Management
- **Punch In/Out**: Location-based attendance tracking
- **Real-time Status**: Live attendance status display
- **Location Services**: GPS-based location tracking with fallback
- **Time Calculation**: Automatic working hours calculation

### 📊 Reports & Analytics
- **Daily Reports**: Individual day attendance summary
- **Weekly Reports**: Week-wise attendance analytics
- **Monthly Reports**: Monthly attendance overview
- **Statistics**: Attendance rate, overtime, and trends

### 👤 Profile Management
- **User Profile**: Complete user information display
- **Settings**: PIN management and app preferences
- **Statistics**: Personal attendance statistics
- **Logout**: Secure session management

## Technology Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router with tab-based navigation
- **Styling**: StyleSheet with Linear Gradients
- **Icons**: Lucide React Native
- **Storage**: Expo Secure Store
- **Location**: Expo Location
- **Backend**: JSON Server (Mock API)
- **Fonts**: Inter font family via Expo Google Fonts

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the JSON Server** (in a separate terminal):
   ```bash
   npm run server
   ```
   This starts the mock backend on `http://localhost:3001`

3. **Start the Expo development server**:
   ```bash
   npm run dev
   ```

4. **Or run both simultaneously**:
   ```bash
   npm run dev:full
   ```

### Demo Credentials

#### Quick PIN Login
- PIN: `1234` (John Doe)
- PIN: `5678` (Jane Smith)
- PIN: `0000` (Demo User)

#### Traditional Login
- Username: `john.doe` / Password: `password123`
- Username: `jane.smith` / Password: `password456`
- Username: `demo` / Password: `demo`

## Project Structure

```
├── app/                    # App routes (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── attendance.tsx # Attendance history
│   │   ├── punch.tsx      # Punch in/out
│   │   ├── reports.tsx    # Reports & analytics
│   │   └── profile.tsx    # User profile
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx      # Login screen
│   │   └── setup-pin.tsx  # PIN setup
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── PinInput.tsx       # PIN input component
│   ├── QuickStats.tsx     # Statistics cards
│   └── StatusCard.tsx     # Status display card
├── services/              # API and business logic
│   ├── ApiService.ts      # JSON Server API client
│   ├── AuthService.ts     # Authentication service
│   └── AttendanceService.ts # Attendance management
├── hooks/                 # Custom React hooks
└── db.json               # JSON Server database
```

## API Endpoints

The JSON Server provides the following endpoints:

- `GET /users` - Get all users
- `POST /sessions` - Create user session
- `GET /attendance` - Get attendance records
- `POST /attendance` - Create attendance record
- `GET /companies` - Get company information
- `GET /reports` - Get attendance reports

## Key Features Implementation

### 1. Authentication Flow
- Secure token-based authentication
- Quick PIN for fast access
- Company code validation
- Session management

### 2. Attendance Tracking
- GPS location capture
- Real-time status updates
- Working hours calculation
- Historical data storage

### 3. Data Persistence
- Secure local storage for tokens
- JSON Server for backend simulation
- Real-time data synchronization
- Offline capability considerations

### 4. User Experience
- Intuitive tab navigation
- Real-time clock display
- Smooth animations and transitions
- Responsive design for all screen sizes

## Development Notes

### Platform Compatibility
- **Web**: Full functionality with location fallback
- **iOS/Android**: Native location services and secure storage
- **Cross-platform**: Consistent UI/UX across platforms

### Mock Data
The `db.json` file contains realistic sample data including:
- User profiles with different roles
- Historical attendance records
- Company settings and locations
- Generated reports and statistics

### Security Considerations
- Secure token storage
- Location-based validation
- Session timeout handling
- Data encryption for sensitive information

## Future Enhancements

- [ ] Biometric authentication
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Advanced reporting charts
- [ ] Team management features
- [ ] Integration with HR systems
- [ ] Multi-language support
- [ ] Dark/light theme toggle

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.