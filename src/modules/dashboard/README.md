# Dashboard Modules Architecture

This directory contains the modular dashboard components for the TutorApp. The architecture is designed to be flexible and maintainable by separating concerns into individual modules.

## Structure

```
src/modules/dashboard/
├── student/                    # Student dashboard modules
│   ├── StudentDashboardModule.tsx    # Main student dashboard composer
│   ├── StudentDashboardHeader.tsx    # Header section
│   ├── UpcomingLessons.tsx           # Lessons section
│   └── HomeworkSection.tsx           # Homework section
├── tutor/                     # Tutor dashboard modules
│   ├── TutorDashboardModule.tsx      # Main tutor dashboard composer
│   ├── TutorDashboardHeader.tsx      # Header section
│   └── CoursesSection.tsx            # Courses section
├── types.ts                   # Shared type definitions
├── index.ts                   # Module exports
└── README.md                  # This file
```

## Benefits of This Architecture

1. **Modularity**: Each section is a separate component that can be developed, tested, and maintained independently
2. **Reusability**: Modules can be reused across different pages or contexts
3. **Maintainability**: Changes to one section don't affect others
4. **Flexibility**: Easy to add, remove, or reorder sections
5. **Type Safety**: Centralized type definitions ensure consistency

## Usage

### Student Dashboard

```tsx
import { StudentDashboardModule } from "@/modules/dashboard";

<StudentDashboardModule
  userName="John"
  lessons={lessons}
  homework={homework}
/>;
```

### Tutor Dashboard

```tsx
import { TutorDashboardModule } from "@/modules/dashboard";

<TutorDashboardModule
  firstName="Jane"
  lastName="Doe"
  tutorId="123"
  courses={courses}
/>;
```

## Adding New Sections

1. Create a new component in the appropriate subdirectory
2. Define the component's props interface
3. Add the component to the main dashboard module
4. Update the types file if needed
5. Export from the index file

## Data Flow

- Page components (`page.tsx`) handle data fetching and state management
- Main dashboard modules compose the sections and pass data down
- Individual section modules are pure components that receive props
- Types are centralized in `types.ts` for consistency
