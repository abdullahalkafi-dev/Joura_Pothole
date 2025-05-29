# Joura_Pothole User Flow Diagram

This document visualizes the primary user flows in the Joura_Pothole application.

## Citizen User Flow

```mermaid
flowchart TD
    Start([Start]) --> Register[Register Account]
    Start --> Login[Login to Account]
    Register --> ConfirmEmail[Confirm Email]
    ConfirmEmail --> Login
    Login --> Dashboard[User Dashboard]
    
    Dashboard --> ViewProfile[View/Edit Profile]
    Dashboard --> CreateReport[Create Infrastructure Report]
    Dashboard --> ViewReports[View My Reports]
    Dashboard --> ViewNearby[View Nearby Reports]
    
    CreateReport --> SelectIssueType[Select Issue Type]
    SelectIssueType --> ChooseSeverity[Choose Severity Level]
    ChooseSeverity --> EnterLocation[Enter/Capture Location]
    EnterLocation --> AddDescription[Add Description]
    AddDescription --> UploadMedia[Upload Images/Videos]
    UploadMedia --> SubmitReport[Submit Report]
    SubmitReport --> ReceiveConfirmation[Receive Confirmation]
    
    ViewReports --> TrackStatus[Track Report Status]
    TrackStatus --> ReceiveUpdates[Receive Status Updates]
    
    ViewNearby --> FilterReports[Filter by Issue Type/Status]
    ViewNearby --> ViewOnMap[View Reports on Map]
```

## Admin/Municipal Authority Flow

```mermaid
flowchart TD
    StartAdmin([Start]) --> AdminLogin[Admin Login]
    AdminLogin --> AdminDashboard[Admin Dashboard]
    
    AdminDashboard --> ManageUsers[Manage Users]
    AdminDashboard --> ViewAllReports[View All Reports]
    AdminDashboard --> ViewAnalytics[View Analytics Dashboard]
    
    ManageUsers --> ApproveUsers[Approve User Accounts]
    ManageUsers --> ManageRoles[Manage User Roles]
    
    ViewAllReports --> FilterReports[Filter Reports]
    FilterReports --> AssignReports[Assign Reports to Teams]
    FilterReports --> UpdateStatus[Update Report Status]
    
    UpdateStatus --> InProgress[Mark as In-Progress]
    UpdateStatus --> Completed[Mark as Completed]
    UpdateStatus --> Rejected[Mark as Rejected]
    
    InProgress --> AddComments[Add Comments/Updates]
    Completed --> AddCompletionDetails[Add Completion Details]
    Rejected --> AddRejectionReason[Add Rejection Reason]
    
    AddComments --> NotifyUser[Notify User of Update]
    AddCompletionDetails --> NotifyUser
    AddRejectionReason --> NotifyUser
    
    ViewAnalytics --> ReportsByArea[View Reports by Area]
    ViewAnalytics --> ReportsByType[View Reports by Type]
    ViewAnalytics --> ResolutionMetrics[View Resolution Metrics]
```

## Authentication Flow

```mermaid
flowchart TD
    StartAuth([Start]) --> AttemptLogin[Attempt Login]
    AttemptLogin -- Valid Credentials --> GenerateTokens[Generate JWT Tokens]
    AttemptLogin -- Invalid Credentials --> LoginFailure[Login Failure]
    
    GenerateTokens --> AccessToken[Issue Access Token]
    GenerateTokens --> RefreshToken[Issue Refresh Token]
    AccessToken --> AuthSuccess[Authentication Success]
    
    AuthSuccess --> AccessProtected[Access Protected Resources]
    AccessProtected -- Token Expired --> UseRefresh[Use Refresh Token]
    UseRefresh -- Valid Refresh --> RenewAccess[Renew Access Token]
    UseRefresh -- Invalid Refresh --> ForceLogin[Force Re-login]
    
    LoginFailure --> RetryLogin[Retry Login]
    LoginFailure --> ForgotPassword[Forgot Password Flow]
    
    ForgotPassword --> RequestReset[Request Password Reset]
    RequestReset --> SendEmail[Send Reset Email]
    SendEmail --> ClickLink[User Clicks Reset Link]
    ClickLink --> EnterNewPassword[Enter New Password]
    EnterNewPassword --> ResetSuccess[Password Reset Success]
```