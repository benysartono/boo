@echo off
setlocal

echo Enter something:
set /p PROFILE_ID=

echo You typed: "%PROFILE_ID%"

if "%PROFILE_ID%"=="" echo It is empty.

pause
