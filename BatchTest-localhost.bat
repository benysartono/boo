@echo off
setlocal EnableDelayedExpansion
title BOO API MANUAL TEST (LOCALHOST)

:: ===============================
:: CONFIG (CHANGE PORT HERE ONLY)
:: ===============================
set HOST=http://localhost
set PORT=3000
set BASEURL=%HOST%:%PORT%/boo

echo ==========================================
echo BOO API MANUAL TEST (LOCAL MODE)
echo BASE URL: %BASEURL%
echo ==========================================
echo.

:: ===============================
:: INPUTS
:: ===============================
set PROFILE_ID=
set USER_ID=
set SECOND_USER_ID=

echo Enter PROFILE_ID (leave blank to create one now):
set /p PROFILE_ID=
echo Enter USER_ID (leave blank to create one now):
set /p USER_ID=
echo Enter SECOND_USER_ID (optional):
set /p SECOND_USER_ID=
echo.

:: ===============================
:: CREATE PROFILE
:: ===============================
if not "%PROFILE_ID%"=="" goto PROFILE_DONE

echo Creating PROFILE...
curl -s -X POST "%BASEURL%/profiles" ^
  -H "Content-Type: application/json" ^
  -d "{""name"":""BatchTester"",""title"":""QA"",""description"":""Auto created""}"
echo.
echo Copy profile id and paste below:
set /p PROFILE_ID=
:PROFILE_DONE

:: ===============================
:: CREATE USER
:: ===============================
if not "%USER_ID%"=="" goto USER_DONE

echo Creating USER...
curl -s -X POST "%BASEURL%/users" ^
  -H "Content-Type: application/json" ^
  -d "{""name"":""BatchUser""}"
echo.
echo Copy user id and paste below:
set /p USER_ID=
:USER_DONE

:: ===============================
:: CREATE SECOND USER (OPTIONAL)
:: ===============================
if not "%SECOND_USER_ID%"=="" goto SECOND_USER_DONE

choice /m "Create a second user?"
if errorlevel 2 goto SECOND_USER_DONE

echo Creating SECOND USER...
curl -s -X POST "%BASEURL%/users" ^
  -H "Content-Type: application/json" ^
  -d "{""name"":""SecondUser""}"
echo.
echo Paste second user id:
set /p SECOND_USER_ID=
:SECOND_USER_DONE

echo.
echo PROFILE_ID=%PROFILE_ID%
echo USER_ID=%USER_ID%
echo SECOND_USER_ID=%SECOND_USER_ID%
pause

:: ===============================
:: CREATE COMMENT
:: ===============================
echo [1] Creating comment...
curl -s -X POST "%BASEURL%/comments" ^
  -H "Content-Type: application/json" ^
  -d "{""profileId"":""%PROFILE_ID%"",""userId"":""%USER_ID%"",""text"":""Hello from local batch""}"
echo.
echo Paste COMMENT_ID:
set /p COMMENT_ID=
pause

:: ===============================
:: REPLY
:: ===============================
echo [2] Replying...
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/replies" ^
  -H "Content-Type: application/json" ^
  -d "{""profileId"":""%PROFILE_ID%"",""userId"":""%USER_ID%"",""text"":""Local reply""}"
pause

:: ===============================
:: VOTING
:: ===============================
echo [3] User1 upvote
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/vote" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%"",""value"":1}"
pause

if "%SECOND_USER_ID%"=="" goto SKIP_VOTE2
echo [4] User2 upvote
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/vote" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%SECOND_USER_ID%"",""value"":1}"
:SKIP_VOTE2
pause

echo [5] Toggle vote
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/vote" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%"",""value"":1}"
pause

:: ===============================
:: LIKE / UNLIKE
:: ===============================
echo [6] Like
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/like" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%""}"
pause

echo [7] Unlike
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/unlike" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%""}"
pause

:: ===============================
:: SORT / FILTER
:: ===============================
echo [8] Sort=new
curl -s "%BASEURL%/comments?sort=new"
pause

echo [9] Sort=top
curl -s "%BASEURL%/comments?sort=top"
pause

echo [10] Filter profile + minVotes=1
curl -s "%BASEURL%/comments?profileId=%PROFILE_ID%&minVotes=1&sort=top"
pause

:: ===============================
:: UPDATE / DELETE
:: ===============================
echo [11] Update comment
curl -s -X PUT "%BASEURL%/comments/%COMMENT_ID%" ^
  -H "Content-Type: application/json" ^
  -d "{""text"":""Updated locally""}"
pause

echo [12] Delete comment
curl -s -X DELETE "%BASEURL%/comments/%COMMENT_ID%"
pause

echo ==========================================
echo DONE - LOCAL TESTING COMPLETED
echo ==========================================
pause
endlocal
