# DreamWeb

A platform for capturing dreams, visualizing goals, and tracking progress through intelligent insights and immersive vision boards.

---

# System Architecture

```mermaid
graph TD
    subgraph User_Layer["User Layer"]
        User(("User"))
    end

    subgraph Interface_Layer["Interface Layer"]
        Dashboard["Dashboard"]
        DreamUI["Dream Input"]
        VisionUI["Vision Board"]
        VoiceUI["Voice Notes"]
        AnalyticsUI["Analytics"]
    end

    subgraph Application_Layer["Application Layer"]
        Router["Request Router"]
        DreamController["Dream Manager"]
        VisionController["Vision Controller"]
        AnalysisController["Insight Engine"]
        MediaController["Media Handler"]
    end

    subgraph Service_Layer["Processing Services"]
        DreamService["Dream Logic"]
        AIService["Intelligence Engine"]
        StreakService["Engagement Tracker"]
        VisionService["Vision Builder"]
        ImageService["Image Provider"]
    end

    subgraph Data_Layer["Data Layer"]
        DreamRepo["Dream Data"]
        UserRepo["User Data"]
        MetricsRepo["Metrics Data"]
    end

    subgraph Storage_Layer["Storage"]
        Database[("Persistent Storage")]
    end

    subgraph External["External Services"]
        AI["AI Processing"]
        Assets["Image Assets"]
        Cloud["Media Storage"]
    end

    User --> Dashboard
    User --> DreamUI
    User --> VisionUI
    User --> VoiceUI

    Dashboard --> Router
    DreamUI --> Router
    VisionUI --> Router
    VoiceUI --> Router
    AnalyticsUI --> Router

    Router --> DreamController
    Router --> VisionController
    Router --> AnalysisController
    Router --> MediaController

    DreamController --> DreamService
    VisionController --> VisionService
    AnalysisController --> AIService
    MediaController --> ImageService

    DreamService --> DreamRepo
    AIService --> DreamRepo
    StreakService --> MetricsRepo

    DreamRepo --> Database
    UserRepo --> Database
    MetricsRepo --> Database

    AIService --> AI
    ImageService --> Assets
    VisionService --> Cloud
```

---

# Dream Creation Flow

```mermaid
flowchart TD

User[User enters dream]

Input[Dream Input Interface]

Validate[Validate Dream Data]

Process[Process Dream Logic]

Insights[Generate Insights]

Store[Save Dream]

Dashboard[Update Dashboard]

User --> Input
Input --> Validate
Validate --> Process
Process --> Insights
Insights --> Store
Store --> Dashboard
```

---

# Vision Board Generation Flow

```mermaid
flowchart TD

User[User selects dream]

Analyze[Analyze Dream Context]

SearchImages[Fetch Relevant Images]

ComposeBoard[Compose Vision Board]

StoreBoard[Save Vision Board]

Display[Render Vision Board]

User --> Analyze
Analyze --> SearchImages
SearchImages --> ComposeBoard
ComposeBoard --> StoreBoard
StoreBoard --> Display
```

---

# System Request Lifecycle

```mermaid
sequenceDiagram

participant User
participant UI
participant Router
participant Controller
participant Service
participant Data
participant Storage

User->>UI: Perform Action
UI->>Router: Send Request
Router->>Controller: Route Request
Controller->>Service: Execute Logic
Service->>Data: Request Data
Data->>Storage: Query Storage
Storage-->>Data: Return Data
Data-->>Service: Provide Data
Service-->>Controller: Return Result
Controller-->>UI: Response
UI-->>User: Display Output
```
