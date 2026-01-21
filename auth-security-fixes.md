# Auth Security Configuration Fixes

This document outlines the Auth security configuration changes needed to resolve the Supabase security advisor warnings.

## Issues to Fix

### 1. Auth OTP Long Expiry
**Issue**: OTP expiry exceeds recommended threshold (currently > 1 hour)
**Risk Level**: WARN
**Category**: SECURITY

**Fix**: 
1. Go to Supabase Dashboard → Authentication → Settings
2. Navigate to "Email" provider settings
3. Set "OTP expiry" to **3600 seconds (1 hour)** or less
4. Recommended value: **1800 seconds (30 minutes)**

**Steps**:
```
Dashboard → Authentication → Settings → Email → OTP expiry → Set to 1800 seconds
```

### 2. Leaked Password Protection Disabled
**Issue**: Leaked password protection is currently disabled
**Risk Level**: WARN  
**Category**: SECURITY

**Fix**:
1. Go to Supabase Dashboard → Authentication → Settings
2. Navigate to "Security" section
3. Enable "Leaked Password Protection"
4. This will check passwords against HaveIBeenPwned.org database

**Steps**:
```
Dashboard → Authentication → Settings → Security → Enable "Leaked Password Protection"
```

## Implementation Priority

1. **HIGH**: Fix OTP expiry (immediate security impact)
2. **HIGH**: Enable leaked password protection (prevents compromised passwords)
3. **CRITICAL**: Apply function search path fixes (prevents SQL injection via search path manipulation)

## Verification

After applying these fixes:

1. **OTP Expiry**: Check that new OTP codes expire within the configured timeframe
2. **Password Protection**: Try registering with a known compromised password (should be rejected)
3. **Function Security**: Run the security advisor again to verify all warnings are resolved

## Related Files

- `complete-function-search-path-fix.sql` - Fixes all function search path issues
- `fix-function-search-paths.sql` - Manual fixes for critical functions
- `generate-all-function-fixes.sql` - Automated approach to fix all functions

## Notes

- These Auth settings changes require dashboard access and cannot be scripted
- Function fixes can be applied via SQL migration
- All changes should be tested in a development environment first
