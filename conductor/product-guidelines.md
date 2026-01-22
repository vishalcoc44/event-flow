# Product Guidelines: EventFlow

## Prose & Communication Style
- **User-Facing Content:** A balanced approach that is both **professional and authoritative** yet **friendly and helpful**. Content should be clear and direct to inspire confidence, while remaining approachable and encouraging to foster a sense of community.
- **Brand Messaging:** Focus on empowerment, ease of use, and real-time connectivity.

## Documentation Standards
- **Code Documentation:** Prefer **descriptive** comments that explain the 'why' behind complex logic.
- **Type Safety:** Leverage **TypeScript interfaces and JSDoc** as the primary source of truth for data structures and function signatures. Documentation should be integrated into the code as much as possible.

## Visual Identity & UX Principles
- **Clarity & Contrast:** Prioritize high readability and distinct UI elements. The interface must be easy to navigate, even when displaying complex data.
- **Delightful Interactions:** Incorporate **smooth animations and transitions** (using Framer Motion) to provide meaningful feedback and a high-quality feel.
- **Efficient Information Density:** For organizer dashboards, prioritize a **data-dense** layout that provides a comprehensive overview without sacrificing clarity. Use progressive disclosure for secondary details.

## Technical Design Patterns
- **React Components:** Follow Shadcn/UI patterns for accessibility and consistency.
- **State Management:** Utilize React Context and Custom Hooks for clean, modular state handling.
- **Backend Integration:** Maintain a 'Thick Database, Thin Client' approach using Supabase RPCs for business logic.