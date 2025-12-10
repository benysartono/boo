@echo off
setlocal
title BOO API MANUAL TEST (Windows CMD)

echo ==========================================
echo BOO API MANUAL TEST (CREATE / VOTE / SORT / FILTER)
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
if "%PROFILE_ID%"=="" goto CREATE_PROFILE
goto PROFILE_DONE

:CREATE_PROFILE
echo Creating PROFILE...
curl -s -X POST "http://localhost:3000/boo/profiles" ^
  -H "Content-Type: application/json" ^
  -d "{""name"":""BatchTester"",""title"":""QA"",""description"":""Auto created""}"
echo.
echo Copy the returned profile id below:
set /p PROFILE_ID=Enter PROFILE_ID:
:PROFILE_DONE


::-----------------------------------------
:: CREATE USER IF EMPTY
::-----------------------------------------
if "%USER_ID%"=="" goto CREATE_USER
goto USER_DONE

:CREATE_USER
echo Creating USER...
curl -s -X POST "http://localhost:3000/boo/users" ^
  -H "Content-Type: application/json" ^
  -d "{""name"":""BatchUser""}"
echo.
echo Copy the returned user id below:
set /p USER_ID=Enter USER_ID:
:USER_DONE


::-----------------------------------------
:: CREATE SECOND USER OPTIONAL
::-----------------------------------------
if "%SECOND_USER_ID%"=="" goto ASK_SECOND_USER
goto SECOND_USER_DONE

:ASK_SECOND_USER
choice /m "Create a second user?"
if errorlevel 2 goto SECOND_USER_DONE

echo Creating SECOND USER...
curl -s -X POST "http://localhost:3000/boo/users" ^
  -H "Content-Type: application/json" ^
  -d "{""name"":""SecondUser""}"
echo.
echo Paste second user id (or press Enter to skip):
set /p SECOND_USER_ID=
:SECOND_USER_DONE


echo.
echo PROFILE_ID=%PROFILE_ID%
echo USER_ID=%USER_ID%
echo SECOND_USER_ID=%SECOND_USER_ID%
echo.


::-----------------------------------------
:: CREATE COMMENT
::-----------------------------------------
echo [1] Creating a comment...
curl -s -X POST "http://localhost:3000/boo/comments" ^
  -H "Content-Type: application/json" ^
  -d "{""profileId"":""%PROFILE_ID%"",""userId"":""%USER_ID%"",""text"":""Hello from batch script""}"
echo.
echo Paste comment id:
set /p COMMENT_ID=Enter COMMENT_ID:


::-----------------------------------------
:: REPLY, VOTES, LIKES, SORTING, DELETE
:: (same as before; safe to keep)
::-----------------------------------------

echo [2] Replying...
curl -s -X POST "http://localhost:3000/boo/comments/%COMMENT_ID%/replies" ^
  -H "Content-Type: application/json" ^
  -d "{""profileId"":""%PROFILE_ID%"",""userId"":""%USER_ID%"",""text"":""Batch reply""}"
pause

echo [3] Upvote...
curl -s -X POST "http://localhost:3000/boo/comments/%COMMENT_ID%/vote" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%"",""value"":1}"
pause

if "%SECOND_USER_ID%"=="" goto SKIP_SECOND_VOTE
echo [4] Second user upvote...
curl -s -X POST "http://localhost:3000/boo/comments/%COMMENT_ID%/vote" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%SECOND_USER_ID%"",""value"":1}"
:SKIP_SECOND_VOTE
pause

echo [5] Toggle vote...
curl -s -X POST "http://localhost:3000/boo/comments/%COMMENT_ID%/vote" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%"",""value"":1}"
pause

echo [6] Like...
curl -s -X POST "http://localhost:3000/boo/comments/%COMMENT_ID%/like" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%""}"
pause

echo [7] Unlike...
curl -s -X POST "http://localhost:3000/boo/comments/%COMMENT_ID%/unlike" ^
  -H "Content-Type: application/json" ^
  -d "{""userId"":""%USER_ID%""}"
pause

echo [8] Sort=new
curl -s "http://localhost:3000/boo/comments?sort=new"
pause

echo [9] Sort=top
curl -s "http://localhost:3000/boo/comments?sort=top"
pause

echo [10] Filter profile minVotes=1
curl -s "http://localhost:3000/boo/comments?profileId=%PROFILE_ID%&minVotes=1&sort=top"
pause

echo [11] Update comment
curl -s -X PUT "http://localhost:3000/boo/comments/%COMMENT_ID%" ^
  -H "Content-Type: application/json" ^
  -d "{""text"":""Updated by Batch""}"
pause

echo [12] Delete comment
curl -s -X DELETE "http://localhost:3000/boo/comments/%COMMENT_ID%"
pause

echo DONE.
pause

endlocal
