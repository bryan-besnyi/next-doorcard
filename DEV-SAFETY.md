# Development Safety Measures

This project includes safety measures to prevent multiple development servers from running simultaneously.

## 🛡️ Safe Development Commands

### Primary Command (Recommended)
```bash
npm run dev
```
- ✅ **Automatically kills existing dev servers before starting**
- ✅ **Prevents port conflicts**
- ✅ **Ensures clean environment**
- ✅ **Handles graceful shutdown**

### Unsafe Command (Emergency Use Only)
```bash
npm run dev:unsafe
```
- ⚠️ **Directly runs `next dev` without safety checks**
- ⚠️ **May cause port conflicts**
- ⚠️ **Only use if safe command fails**

## 🔧 What the Safe Script Does

1. **Process Detection**: Scans for existing Next.js dev servers
2. **Port Cleanup**: Kills processes using ports 3000-3001  
3. **Graceful Termination**: Waits for processes to fully stop
4. **Clean Start**: Launches fresh development server
5. **Signal Handling**: Properly handles Ctrl+C and termination

## 🚨 Manual Cleanup (If Needed)

If you ever need to manually kill development processes:

```bash
# Check running processes
ps aux | grep -E "(next|node.*dev)" | grep -v grep

# Kill specific processes
kill [PID_NUMBER]

# Nuclear option (kills all Node processes)
pkill -f node
```

## 📁 Files Involved

- **`scripts/dev-safe.js`**: Main safety script
- **`package.json`**: Updated scripts configuration
- **`.gitignore`**: Ignores development tracking files

## 🎯 Benefits

- **No More Port Conflicts**: Never see "Port 3000 is in use" again
- **Clean Development**: Each start is fresh and predictable
- **Automatic Cleanup**: No manual process management needed
- **Consistent Environment**: Same behavior across different systems

## 🔄 Migration

Old workflow:
```bash
# BAD: Could create multiple servers
npm run dev  # First terminal
npm run dev  # Second terminal (creates conflict)
```

New workflow:
```bash
# GOOD: Always safe
npm run dev  # Automatically handles cleanup
```

Remember: **Always use `npm run dev`** for development! 