# Centralized Type System

This directory contains all TypeScript types for the Next.js Doorcard application, organized by domain and functionality.

## Structure

```
types/
├── index.ts                    # Main exports
├── doorcard.ts                 # Core domain types
├── next-auth.d.ts             # NextAuth extensions
├── components/
│   ├── ui.ts                  # UI component types
│   ├── forms.ts               # Form component types
│   └── layout.ts              # Layout component types
├── pages/
│   ├── dashboard.ts           # Dashboard page types
│   ├── public.ts              # Public page types
│   ├── admin.ts               # Admin page types
│   └── view.ts                # View page types
├── store/
│   └── doorcard.ts            # Zustand store types
├── api/
│   ├── utils.ts               # API utility types
│   ├── validation.ts          # Validation types
│   └── responses.ts           # API response types
├── hooks/
│   └── toast.ts               # Hook-specific types
├── analytics/
│   └── tracking.ts            # Analytics types
└── terms/
    └── management.ts          # Term management types
```

## Usage

### Importing Types

```typescript
// Import specific types
import type { Doorcard } from "@/types/pages/dashboard";
import type { BasicInfo } from "@/types/store/doorcard";

// Import all types
import * as Types from "@/types";

// Import from main index
import type { Doorcard, BasicInfo } from "@/types";
```

### Adding New Types

1. **Component Types**: Add to `types/components/`
2. **Page Types**: Add to `types/pages/`
3. **API Types**: Add to `types/api/`
4. **Store Types**: Add to `types/store/`
5. **Hook Types**: Add to `types/hooks/`

### Migration Guide

To migrate existing types:

1. Run the migration script: `npm run migrate-types`
2. Move types to appropriate directories
3. Update imports in components
4. Remove old type definitions

## Benefits

- ✅ **Better IntelliSense**: Centralized types improve IDE support
- ✅ **Type Safety**: Consistent type usage across the application
- ✅ **Maintainability**: Easy to find and update types
- ✅ **Scalability**: Clear structure for future additions
- ✅ **Code Organization**: Logical grouping by domain

## Migration Status

- ✅ Core domain types (`doorcard.ts`)
- ✅ NextAuth extensions (`next-auth.d.ts`)
- ✅ UI component types (`components/ui.ts`)
- ✅ Form component types (`components/forms.ts`)
- ✅ Page types (`pages/*.ts`)
- ✅ Store types (`store/doorcard.ts`)
- ✅ API types (`api/*.ts`)
- ✅ Hook types (`hooks/toast.ts`)
- ✅ Analytics types (`analytics/tracking.ts`)
- ✅ Term management types (`terms/management.ts`)

## Next Steps

1. Run `npm run migrate-types` to identify remaining types
2. Move remaining types to appropriate directories
3. Update all import statements
4. Remove old type definitions
5. Run `npm run type-check` to verify everything works 