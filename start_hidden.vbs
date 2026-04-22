Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\patri\.gemini\antigravity\playground\real_estate_tracker"
WshShell.Run "cmd.exe /c npx tsx daemon.ts", 0, false
