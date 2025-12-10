@echo off
setlocal
title BOO API MANUAL TEST (Windows CMD - Replit Version)

:: ==========================================
:: CONFIGURE YOUR PUBLIC ENDPOINT HERE
:: ==========================================
set BASEURL=https://8a474806-c0fe-45f5-ab95-b14e8bbc296d-00-14b3k6ql2q1ci.sisko.replit.dev/boo

echo ==========================================
echo BOO API MANUAL TEST (CREATE / VOTE / SORT / FILTER)
echo Using endpoint: %BASEURL%
echo ==========================================
echo.

echo Enter PROFILE_ID (leave blank to create one now):
set /p PROFILE_ID=
echo Enter USER_ID (leave blank to create one now):
set /p USER_ID=
echo Enter SECOND_USER_ID (optional, for voting by another user):
set /p SECOND_USER_ID=
echo.

::-----------------------------------------
:: CREATE PROFILE IF EMPTY
::-----------------------------------------
if "%PROFILE_ID%"=="" (
  echo Creating PROFILE...
  curl -s -X POST "%BASEURL%/profiles" ^
    -H "Content-Type: application/json" ^
    -d "{""name"":""BatchTester"",""title"":""QA"",""description"":""Auto created""}"
  echo.
  echo Paste returned profile id:
  set /p PROFILE_ID=
)

::-----------------------------------------
:: CREATE USER IF EMPTY
::-----------------------------------------
if "%USER_ID%"=="" (
  echo Creating USER...
  curl -s -X POST "%BASEURL%/users" ^
    -H "Content-Type: application/json" ^
    -d "{""name"":""BatchUser""}"
  echo.
  echo Paste returned user id:
  set /p USER_ID=
)

::-----------------------------------------
:: CREATE SECOND USER OPTIONAL
::-----------------------------------------
if "%SECOND_USER_ID%"=="" (
  choice /m "Create a second user?"
  if errorlevel 1 (
    echo Creating SECOND USER...
    curl -s -X POST "%BASEURL%/users" ^
      -H "Content-Type: application/json" ^
      -d "{""name"":""SecondUser""}"
    echo.
    echo Paste second user id:
    set /p SECOND_USER_ID=
  )
)

echo.
echo PROFILE_ID=%PROFILE_ID%
echo USER_ID=%USER_ID%
echo SECOND_USER_ID=%SECOND_USER_ID%
echo.

::-----------------------------------------
:: CREATE COMMENT
::-----------------------------------------
echo [1] Creating a comment...
curl -s -X POST "%BASEURL%/comments" ^
  -H "Content-Type: application/json" ^
  -d "{""profileId"":""%PROFILE_ID%"",""userId"":""%USER_ID%"",""text"":""Hello from batch script""}"
echo.
set /p COMMENT_ID=Enter COMMENT_ID:

::-----------------------------------------
:: REPLY
::-----------------------------------------
echo [2] Replying to comment...
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/replies" ^
  -H "Content-Type: application/json" ^
  -d "{""profileId"":""%PROFILE_ID%"",""userId"":""%USER_ID%"",""text"":""Batch reply""}"
pause

::-----------------------------------------
:: UPVOTE
::-----------------------------------------
echo [3] Upvote...
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/vote" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%"",""value"":1}"
pause

if not "%SECOND_USER_ID%"=="" (
  echo [4] Second user upvote...
  curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/vote" ^
    -H "Content-Type: application/json" ^
    -d "{""userId"":""%SECOND_USER_ID%"",""value"":1}"
  pause
)

::-----------------------------------------
:: TOGGLE VOTE
::-----------------------------------------
echo [5] Toggle vote off...
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/vote" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%"",""value"":1}"
pause

::-----------------------------------------
:: LIKE / UNLIKE
::-----------------------------------------
echo [6] Like...
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/like" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%""}"
pause

echo [7] Unlike...
curl -s -X POST "%BASEURL%/comments/%COMMENT_ID%/unlike" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%""}"
pause

::-----------------------------------------
:: SORT + FILTER
::-----------------------------------------
echo [8] Sort=new
curl -s "%BASEURL%/comments?sort=new"
pause

echo [9] Sort=top
curl -s "%BASEURL%/comments?sort=top"
pause

echo [10] Filter (profile, minVotes=1)
curl -s "%BASEURL%/comments?profileId=%PROFILE_ID%&minVotes=1&sort=top"
pause

::-----------------------------------------
:: UPDATE + DELETE
::-----------------------------------------
echo [11] Update comment
curl -s -X PUT "%BASEURL%/comments/%COMMENT_ID%" ^
  -H "Content-Type: application/json" ^
  -d "{""text"":""Updated by Batch""}"
pause

echo [12] Delete comment
curl -s -X DELETE "%BASEURL%/comments/%COMMENT_ID%"
pause

echo DONE.
pause

endlocal
